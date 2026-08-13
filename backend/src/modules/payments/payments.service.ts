import axios from "axios";
import { PaymentStatus } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";

function hasMpConfigured(): boolean {
  return Boolean(env.mercadopagoAccessToken);
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
  };
}

export async function createCheckout(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }

  const amountBRL = env.planPriceBRL;

  const payment = await prisma.payment.create({
    data: {
      userId,
      status: PaymentStatus.PENDING,
      amountBRL,
      plan: "mensal",
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
          title: "GuiaSense - Plano Mensal",
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
      notification_url: `${env.frontendUrl}/api/payments/webhook`,
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
}) {
  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.APPROVED },
  });
  await prisma.user.update({
    where: { id: payment.userId },
    data: { accessStatus: "LIBERADO" },
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
      const paymentData = response.data as { status?: string };
      if (paymentData.status === "approved") {
        const payment = await prisma.payment.findFirst({ where: { mpPaymentId: String(id) } });
        if (payment) return applyPaymentApproval(payment);
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

export async function simulateApproval(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw new HttpError(404, "Pagamento não encontrado.");
  }

  return applyPaymentApproval(payment);
}
