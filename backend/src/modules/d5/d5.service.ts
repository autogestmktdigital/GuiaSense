import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  MonthProjection,
  MonthProjectionOrigin,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { chatCompletion, deepseekEnabled } from "../../lib/ai";
import {
  buildD5Facts,
  D5Facts,
  isEmptyProjection,
  MONTH_NAMES,
  systemNow,
  todayInWindow,
  currentMonthUTC,
} from "./facts";
import { buildSystemPrompt, buildUserPrompt, isValidProjectionMessage } from "./prompt";
import { buildD5Fallback } from "./fallback";

export type VigentProjectionInsight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

async function generateMessage(
  facts: D5Facts,
): Promise<{ message: string; origin: MonthProjectionOrigin }> {
  if (deepseekEnabled()) {
    try {
      const system = buildSystemPrompt();
      const first = await chatCompletion({ system, user: buildUserPrompt(facts, false) });
      if (isValidProjectionMessage(first, facts)) {
        return { message: first.trim(), origin: MonthProjectionOrigin.IA };
      }

      const second = await chatCompletion({ system, user: buildUserPrompt(facts, true) });
      if (isValidProjectionMessage(second, facts)) {
        return { message: second.trim(), origin: MonthProjectionOrigin.IA };
      }

      console.warn("[d5] Resposta da IA rejeitada na validação, usando fallback.");
    } catch (error) {
      console.error("[d5] DeepSeek falhou, usando fallback", error);
    }
  }

  return { message: buildD5Fallback(facts), origin: MonthProjectionOrigin.FALLBACK };
}

function severityFor(
  classification: "PREVISAO_POSITIVA" | "PREVISAO_EQUILIBRADA" | "PREVISAO_NEGATIVA",
): AlertSeverity {
  return classification === "PREVISAO_NEGATIVA" ? AlertSeverity.WARNING : AlertSeverity.INFO;
}

function isUniqueViolation(error: unknown): boolean {
  const prismaError = error as { code?: string };
  return prismaError?.code === "P2002";
}

async function syncProjectionAlert(projection: MonthProjection): Promise<void> {
  const existing = await prisma.alert.findUnique({ where: { projectionId: projection.id } });
  if (existing) return;

  await prisma.alert.create({
    data: {
      userId: projection.userId,
      type: AlertType.ORIENTACAO_D5,
      severity: severityFor(projection.classification),
      message: projection.message,
      status: AlertStatus.ACTIVE,
      projectionId: projection.id,
    },
  });
}

export async function ensureD5(userId: string, now: Date = systemNow()): Promise<MonthProjection | null> {
  const { year, month } = currentMonthUTC(now);
  if (!todayInWindow(now, year, month)) return null;

  const existing = await prisma.monthProjection.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return existing;

  const facts = await buildD5Facts(prisma, userId, year, month, now);
  if (isEmptyProjection(facts)) return null;

  const generated = await generateMessage(facts);

  try {
    const projection = await prisma.monthProjection.create({
      data: {
        userId,
        year,
        month,
        analyzedAt: now,
        received: facts.received,
        pendingIncome: facts.pendingIncome,
        paid: facts.paid,
        pendingExpense: facts.pendingExpense,
        balance: facts.balance,
        projectedBalance: facts.projectedBalance,
        classification: facts.classification,
        message: generated.message,
        origin: generated.origin,
      },
    });
    await syncProjectionAlert(projection);
    return projection;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.monthProjection.findUnique({
        where: { userId_year_month: { userId, year, month } },
      });
    }
    throw error;
  }
}

export async function getVigentProjectionInsight(
  userId: string,
  now: Date = systemNow(),
): Promise<VigentProjectionInsight | null> {
  const { year, month } = currentMonthUTC(now);
  if (!todayInWindow(now, year, month)) return null;

  const projection = await ensureD5(userId, now);
  if (!projection) return null;

  const tone =
    projection.classification === "PREVISAO_NEGATIVA"
      ? "attention"
      : projection.classification === "PREVISAO_POSITIVA"
        ? "positive"
        : "neutral";

  return {
    title: `Previsão do fechamento de ${MONTH_NAMES[projection.month - 1]}`,
    message: projection.message,
    tone,
  };
}