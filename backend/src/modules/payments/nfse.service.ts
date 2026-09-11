import axios from "axios";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";
import { decryptField } from "../../lib/crypto";
import { getPlan } from "./plans";

const BASE_URL =
  env.focusNfeEnv === "producao"
    ? "https://api.focusnfe.com.br/v2"
    : "https://homologacao.focusnfe.com.br/v2";

const HEADERS = { "Content-Type": "application/json" };

export function isNfseConfigured(): boolean {
  return Boolean(
    env.focusNfeToken &&
      env.focusNfeEmitterCnpj &&
      env.focusNfeEmitterIm &&
      env.focusNfeServiceItem,
  );
}

function auth() {
  return {
    username: env.focusNfeToken,
    password: "",
  };
}

export async function emitInvoiceForPayment(paymentId: string): Promise<void> {
  if (!isNfseConfigured()) return;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true },
  });
  if (!payment || payment.status !== "APPROVED") return;

  const cpfCnpj = decryptField(payment.user.cpfCnpj);
  if (!cpfCnpj) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        nfeStatus: "sem_dados_fiscais",
        nfeMessage: "Tomador sem CPF/CNPJ cadastrado.",
      },
    });
    return;
  }
  if (
    !payment.user.billingStreet ||
    !payment.user.billingZip ||
    !payment.user.billingCity ||
    !payment.user.billingState
  ) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        nfeStatus: "sem_dados_fiscais",
        nfeMessage: "Endereco de cobranca incompleto.",
      },
    });
    return;
  }

  const plan = getPlan(payment.plan);
  const amount = Number(payment.amountBRL);
  const discrimination = env.focusNfeServiceDiscrimination.replace(
    "{plano}",
    plan.label,
  );
  const serviceItemCode = env.focusNfeServiceItem.replace(/\D/g, "").padStart(4, "0");

  const payload = {
    data_emissao: new Date().toISOString(),
    natureza_operacao: "1",
    optante_simples_nacional: env.focusNfeEmitterSimples,
    regime_especial_tributacao: env.focusNfeEmitterRegime,
    prestador: {
      cnpj: env.focusNfeEmitterCnpj,
      inscricao_municipal: env.focusNfeEmitterIm,
      codigo_municipio: env.focusNfeEmitterIbge,
    },
    tomador: {
      ...(cpfCnpj.length === 11 ? { cpf: cpfCnpj } : { cnpj: cpfCnpj }),
      razao_social: payment.user.name,
      email: payment.user.email,
      endereco: {
        logradouro: payment.user.billingStreet,
        numero: payment.user.billingNumber || "S/N",
        complemento: payment.user.billingComplement || undefined,
        bairro: payment.user.billingDistrict || "",
        codigo_municipio: env.focusNfeEmitterIbge,
        uf: payment.user.billingState,
        cep: payment.user.billingZip.replace(/\D/g, ""),
      },
    },
    servico: {
      valor_servicos: amount,
      iss_retido: false,
      item_lista_servico: serviceItemCode,
      codigo_tributario_municipio: env.focusNfeServiceTaxCode,
      discriminacao: discrimination,
      codigo_municipio: env.focusNfeEmitterIbge,
      aliquota: env.focusNfeServiceRate / 100,
    },
  };

  const ref = `PAG-${paymentId}`;

  try {
    const response = await axios.post(
      `${BASE_URL}/nfse?ref=${encodeURIComponent(ref)}`,
      payload,
      {
        auth: auth(),
        headers: HEADERS,
        timeout: 30000,
      },
    );
    const data = response.data as {
      ref?: string;
      numero_rps?: string;
      status?: string;
      mensagem?: string;
    };
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        nfeRef: data.ref || ref,
        nfeNumber: data.numero_rps || null,
        nfeStatus: data.status || "processando_autorizacao",
        nfeMessage: data.mensagem || null,
        nfeEmittedAt: new Date(),
      },
    });
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    const message = axios.isAxiosError(err)
      ? typeof err.response?.data === "string"
        ? err.response.data
        : JSON.stringify(err.response?.data ?? err.message)
      : err instanceof Error
        ? err.message
        : "Erro na emissao da NFS-e.";
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        nfeStatus: status === 401 ? "nao_autorizado" : "erro",
        nfeMessage: message,
      },
    });
  }
}

export async function consultInvoice(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    throw new HttpError(404, "Pagamento nao encontrado.");
  }
  if (!payment.nfeRef) {
    throw new HttpError(400, "NFS-e ainda nao emitida para este pagamento.");
  }

  const response = await axios.get(
    `${BASE_URL}/nfse/${encodeURIComponent(payment.nfeRef)}`,
    { auth: auth(), headers: HEADERS, timeout: 30000 },
  );
  const data = response.data as {
    status?: string;
    numero?: string;
    numero_nfse?: string;
    numero_rps?: string;
    mensagem?: string;
    caminho_danfse?: string;
    url?: string;
  };

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      nfeStatus: data.status || null,
      nfeNumber:
        data.numero || data.numero_nfse || data.numero_rps || payment.nfeNumber,
      nfeUrl: data.caminho_danfse || data.url || payment.nfeUrl,
      nfeMessage: data.mensagem || null,
    },
  });

  return data;
}

export async function handleNfseWebhook(body: unknown, authorization?: string) {
  if (env.focusNfeWebhookSecret) {
    const token = (authorization || "").replace(/^Bearer\s+/i, "");
    if (token !== env.focusNfeWebhookSecret) {
      throw new HttpError(401, "Webhook não autorizado.");
    }
  }

  const data = body as {
    ref?: string;
    status?: string;
    numero?: string;
    numero_nfse?: string;
    numero_rps?: string;
    mensagem?: string;
    caminho_danfse?: string;
    url?: string;
    erros?: { codigo?: string; mensagem?: string }[];
  };

  if (!data.ref) return { ok: true, handled: false };

  const message =
    data.mensagem ||
    data.erros?.map((e) => `${e.codigo}: ${e.mensagem}`).join("; ") ||
    null;

  const result = await prisma.payment.updateMany({
    where: {
      OR: [{ nfeRef: data.ref }, { id: data.ref.replace(/^PAG-/, "") }],
    },
    data: {
      nfeStatus: data.status || "processando_autorizacao",
      nfeNumber:
        data.numero || data.numero_nfse || data.numero_rps || undefined,
      nfeUrl: data.caminho_danfse || data.url || undefined,
      nfeMessage: message,
    },
  });

  return { ok: true, handled: result.count > 0 };
}