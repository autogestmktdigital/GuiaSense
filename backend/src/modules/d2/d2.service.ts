import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  MonthProjectionD2,
  MonthProjectionOrigin,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { chatCompletion, deepseekEnabled } from "../../lib/ai";
import { MONTH_NAMES, currentMonthUTC } from "../d5/facts";
import {
  buildD2Facts,
  D2Facts,
  d2DayOfMonth,
  isEmptyProjectionD2,
  isD2Day,
  systemNow,
} from "./facts";
import { buildD2SystemPrompt, buildD2UserPrompt, isValidD2Message } from "./prompt";
import { buildD2Fallback } from "./fallback";

export type D2Insight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

async function generateMessage(
  facts: D2Facts,
): Promise<{ message: string; origin: MonthProjectionOrigin }> {
  if (deepseekEnabled()) {
    try {
      const system = buildD2SystemPrompt();
      const first = await chatCompletion({ system, user: buildD2UserPrompt(facts, false) });
      if (isValidD2Message(first, facts)) {
        return { message: first.trim(), origin: MonthProjectionOrigin.IA };
      }

      console.warn("[d2] Resposta inicial da IA rejeitada, tentando novamente.");
      const second = await chatCompletion({ system, user: buildD2UserPrompt(facts, true) });
      if (isValidD2Message(second, facts)) {
        return { message: second.trim(), origin: MonthProjectionOrigin.IA };
      }

      console.warn("[d2] Resposta da IA rejeitada na validação, usando fallback.");
    } catch (error) {
      console.error("[d2] DeepSeek falhou, usando fallback", error);
    }
  }

  return { message: buildD2Fallback(facts), origin: MonthProjectionOrigin.FALLBACK };
}

function severityFor(classification: D2Facts["classification"]): AlertSeverity {
  return classification === "PREVISAO_NEGATIVA" ? AlertSeverity.WARNING : AlertSeverity.INFO;
}

function isUniqueViolation(error: unknown): boolean {
  const prismaError = error as { code?: string };
  return prismaError?.code === "P2002";
}

async function syncD2Alert(projection: MonthProjectionD2): Promise<void> {
  const existing = await prisma.alert.findUnique({ where: { projectionD2Id: projection.id } });
  if (existing) return;

  await prisma.alert.create({
    data: {
      userId: projection.userId,
      type: AlertType.ORIENTACAO_D2,
      severity: severityFor(projection.classification),
      message: projection.message,
      status: AlertStatus.ACTIVE,
      projectionD2Id: projection.id,
    },
  });
}

export async function ensureD2(
  userId: string,
  now: Date = systemNow(),
): Promise<MonthProjectionD2 | null> {
  const { year, month } = currentMonthUTC(now);
  if (!isD2Day(now, year, month)) return null;

  const existing = await prisma.monthProjectionD2.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return existing;

  const d5 = await prisma.monthProjection.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (!d5) return null;

  const facts = await buildD2Facts(prisma, userId, year, month, now, d5);
  if (isEmptyProjectionD2(facts)) return null;

  const generated = await generateMessage(facts);

  try {
    const projection = await prisma.monthProjectionD2.create({
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
        d5ProjectedBalance: facts.d5ProjectedBalance,
        d5Classification: facts.d5Classification,
        projectionDifference: facts.projectionDifference,
        variationType: facts.variationType,
        classificationChanged: facts.classificationChanged,
        facts: facts.relevantFacts,
        message: generated.message,
        origin: generated.origin,
      },
    });
    await syncD2Alert(projection);
    return projection;
  } catch (error) {
    if (isUniqueViolation(error)) {
      return prisma.monthProjectionD2.findUnique({
        where: { userId_year_month: { userId, year, month } },
      });
    }
    throw error;
  }
}

function toInsight(projection: MonthProjectionD2): D2Insight {
  const tone =
    projection.classification === "PREVISAO_NEGATIVA"
      ? "attention"
      : projection.classification === "PREVISAO_POSITIVA"
        ? "positive"
        : "neutral";

  return {
    title: `Atualização do fechamento de ${MONTH_NAMES[projection.month - 1]}`,
    message: projection.message,
    tone,
  };
}

export async function getVigentD2Insight(
  userId: string,
  now: Date = systemNow(),
): Promise<D2Insight | null> {
  const { year, month } = currentMonthUTC(now);

  const existing = await prisma.monthProjectionD2.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });
  if (existing) return toInsight(existing);

  if (now.getUTCDate() < d2DayOfMonth(year, month)) return null;

  if (isD2Day(now, year, month)) {
    const created = await ensureD2(userId, now);
    return created ? toInsight(created) : null;
  }

  return null;
}