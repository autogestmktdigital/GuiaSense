import axios from "axios";
import { PaymentStatus } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";
import { getPlan, GRACE_DAYS, PLANS, planExpiresFor, TRIAL_DAYS } from "./plans";

function hasMpConfigured(): boolean {
  return Boolean(env.mercadopagoAccessToken);
}

export function planGraceDays(): number {
  return GRACE_DAYS;
}

export function listPlans() {
  return PLANS;
}

export async function getStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }

  const lastPayment = await prisma.payment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return {
    accessStatus: user.accessStatus,
    paymentStatus: lastPayment?.status ?? null,
    lastPayment,
    planExpiresAt: user.planExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
  };
}

export function trialDays(): number {
  return TRIAL_DAYS;
}

export async function expireOverduePlans(): Promise<{ plansExpired: number; trialsExpired: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - GRACE_DAYS * 24 * 60 * 60 * 1000);

  const [plansExpired, trialsExpired] = await Promise.all([
    prisma.user.updateMany({
      where: {
        accessStatus: "LIBERADO",
        planExpiresAt: { not: null, lt: cutoff },
      },
      data: { accessStatus: "PAGAMENTO_PENDENTE" },
    }),
    prisma.user.updateMany({
      where: {
        accessStatus: "LIBERADO",
        trialExpiresAt: { not: null, lt: now },
      },
      data: { accessStatus: "PAGAMENTO_PENDENTE" },
    }),
  ]);

  return { plansExpired: plansExpired.count, trialsExpired: trialsExpired.count };
}

export async function createCheckout(userId: string, planId?: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }

  const plan = getPlan(planId);
  const amountBRL = plan.priceBRL;

  const payment = await prisma.payment.create({
    data: {
      userId,
      status: PaymentStatus.PENDING,
      amountBRL,
      plan: plan.id,
    },
  });

  if (!hasMpConfigured()) {
    return {
      mode: "simulated",
      message: "Mercado Pago não configurado. Use o webhook de simulação para liberar o acesso.",
      paymentId: payment.id,
    };
  }

  const response = await axios.post(
    "https://api.mercadopago.com/checkout/preferences",
    {
      items: [
        {
          title: `GuiaSense - Plano ${plan.label}`,
          quantity: 1,
          unit_price: amountBRL,
          currency_id: "BRL",
        },
      ],
      back_urls: {
        success: `${env.frontendUrl}/settings`,
        pending: `${env.frontendUrl}/settings`,
        failure: `${env.frontendUrl}/settings`,
      },
      auto_return: "approved",
      notification_url: `${env.apiUrl}/api/payments/webhook`,
      external_reference: payment.id,
    },
    {
      headers: {
        Authorization: `Bearer ${env.mercadopagoAccessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const preference = response.data as { id: string; init_point: string };

  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: preference.id },
  });

  return { mode: "mercadopago", paymentId: payment.id, initPoint: preference.init_point };
}

async function applyPaymentApproval(payment: {
  id: string;
  userId: string;
  plan: string;
}) {
  const plan = getPlan(payment.plan);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.APPROVED },
  });
  await prisma.user.update({
    where: { id: payment.userId },
    data: {
      accessStatus: "LIBERADO",
      planExpiresAt: planExpiresFor(plan),
      trialExpiresAt: null,
    },
  });

  return { ok: true };
}

export async function handleWebhook(body: unknown) {
  if (env.mercadopagoWebhookSecret && typeof body === "object" && body) {
    const secret = (body as { secret?: string }).secret;
    if (secret && secret !== env.mercadopagoWebhookSecret) {
      throw new HttpError(401, "Webhook não autorizado.");
    }
  }

  const payload = body as {
    type?: string;
    data?: { id?: string };
    action?: string;
  };

  const type = payload.type ?? "payment";
  const id = payload.data?.id;

  if (type === "payment" && id) {
    if (hasMpConfigured()) {
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${id}`, {
        headers: { Authorization: `Bearer ${env.mercadopagoAccessToken}` },
      });
      const paymentData = response.data as {
        status?: string;
        external_reference?: string;
        id?: string;
      };
      if (paymentData.status === "approved") {
        const payment =
          (paymentData.external_reference &&
            (await prisma.payment.findUnique({ where: { id: paymentData.external_reference } }))) ||
          (await prisma.payment.findFirst({ where: { mpPaymentId: String(id) } }));
        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { mpPaymentId: String(id) },
          });
          return applyPaymentApproval(payment);
        }
        return { ok: false, reason: "payment_not_found" };
      }
    } else {
      const payment = await prisma.payment.findFirst({
        where: { mpPaymentId: String(id) },
        orderBy: { createdAt: "desc" },
      });
      if (payment) return applyPaymentApproval(payment);
      return { ok: false, reason: "payment_not_found" };
    }
  }

  return { ok: true, handled: false };
}

export async function reconcileByMpPaymentId(mpPaymentId: string) {
  if (!hasMpConfigured()) {
    return { ok: false, reason: "mercadopago_not_configured" };
  }

  const response = await axios.get(`https://api.mercadopago.com/v1/payments/${mpPaymentId}`, {
    headers: { Authorization: `Bearer ${env.mercadopagoAccessToken}` },
  });
  const paymentData = response.data as { status?: string; order?: { id?: string } };
  if (paymentData.status !== "approved") {
    return { ok: false, reason: `status_${paymentData.status}` };
  }

  let payment = await prisma.payment.findFirst({ where: { mpPaymentId: String(mpPaymentId) } });

  if (!payment && paymentData.order?.id) {
    try {
      const order = await axios.get(
        `https://api.mercadopago.com/merchant_orders/${paymentData.order.id}`,
        { headers: { Authorization: `Bearer ${env.mercadopagoAccessToken}` } },
      );
      const preferenceId = (order.data as { preference_id?: string }).preference_id;
      if (preferenceId) {
        payment = await prisma.payment.findFirst({ where: { mpPreferenceId: preferenceId } });
      }
    } catch {
      payment = null;
    }
  }

  if (!payment) {
    return { ok: false, reason: "payment_not_found" };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { mpPaymentId: String(mpPaymentId) },
  });

  return applyPaymentApproval(payment);
}

export async function simulateApproval(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw new HttpError(404, "Pagamento não encontrado.");
  }

  return applyPaymentApproval(payment);
}
