import {
  AlertSeverity,
  AlertStatus,
  AlertType,
  MonthClosing,
  MonthClosingClassification,
  MonthClosingOrigin,
  MonthClosingStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { chatCompletion, deepseekEnabled } from "../../lib/ai";
import { buildClosingFacts, MONTH_NAMES } from "./facts";
import { buildSystemPrompt, buildUserPrompt, isValidClosingMessage } from "./prompt";
import { buildFallbackMessage } from "./fallback";

function previousMonthUTC(date: Date): { year: number; month: number } {
  const month = date.getUTCMonth() + 1;
  if (month === 1) return { year: date.getUTCFullYear() - 1, month: 12 };
  return { year: date.getUTCFullYear(), month: month - 1 };
}

function isEmptyMonth(facts: Awaited<ReturnType<typeof buildClosingFacts>>): boolean {
  return (
    facts.received === 0 &&
    facts.paid === 0 &&
    facts.pendingExpense === 0 &&
    facts.pendingIncome === 0
  );
}

function severityFor(closing: Pick<MonthClosing, "status" | "classification">): AlertSeverity {
  if (closing.status === "PENDENTE") return AlertSeverity.WARNING;
  if (closing.classification === MonthClosingClassification.NEGATIVO) {
    return AlertSeverity.DANGER;
  }
  return AlertSeverity.INFO;
}

async function generateMessage(
  facts: Awaited<ReturnType<typeof buildClosingFacts>>,
): Promise<{ message: string; origin: MonthClosingOrigin }> {
  if (deepseekEnabled()) {
    try {
      const system = buildSystemPrompt();
      const first = await chatCompletion({ system, user: buildUserPrompt(facts, false) });
      if (isValidClosingMessage(first, facts)) {
        return { message: first.trim(), origin: MonthClosingOrigin.IA };
      }

      const second = await chatCompletion({ system, user: buildUserPrompt(facts, true) });
      if (isValidClosingMessage(second, facts)) {
        return { message: second.trim(), origin: MonthClosingOrigin.IA };
      }

      console.warn("[monthClosing] Resposta da IA rejeitada na validação, usando fallback.");
    } catch (error) {
      console.error("[monthClosing] DeepSeek falhou, usando fallback", error);
    }
  }

  return { message: buildFallbackMessage(facts), origin: MonthClosingOrigin.FALLBACK };
}

async function syncClosingAlert(closing: MonthClosing): Promise<void> {
  const existing = await prisma.alert.findUnique({ where: { closingId: closing.id } });
  const severity = severityFor(closing);

  if (!existing) {
    await prisma.alert.create({
      data: {
        userId: closing.userId,
        type: AlertType.FECHAMENTO_MENSAL,
        severity,
        message: closing.message,
        status: AlertStatus.ACTIVE,
        closingId: closing.id,
      },
    });
    return;
  }

  if (existing.message !== closing.message || existing.severity !== severity) {
    await prisma.alert.update({
      where: { id: existing.id },
      data: { message: closing.message, severity, status: AlertStatus.ACTIVE },
    });
  }
}

export async function upsertMonthClosing(userId: string, year: number, month: number) {
  const facts = await buildClosingFacts(prisma, userId, year, month);
  if (isEmptyMonth(facts)) {
    return null;
  }

  const status: MonthClosingStatus = facts.hasPending ? "PENDENTE" : "FECHADO";
  const classification = facts.hasPending ? null : facts.classification;

  const existing = await prisma.monthClosing.findUnique({
    where: { userId_year_month: { userId, year, month } },
  });

  const factsChanged =
    !existing ||
    existing.status !== status ||
    existing.classification !== classification ||
    Number(existing.balance) !== facts.balance ||
    Number(existing.received) !== facts.received ||
    Number(existing.paid) !== facts.paid ||
    Number(existing.pendingExpense) !== facts.pendingExpense ||
    Number(existing.pendingIncome) !== facts.pendingIncome;

  if (existing && !factsChanged) {
    await syncClosingAlert(existing);
    return existing;
  }

  let message = existing?.message ?? "";
  let origin = existing?.origin ?? MonthClosingOrigin.FALLBACK;

  if (factsChanged) {
    const generated = await generateMessage(facts);
    message = generated.message;
    origin = generated.origin;
  }

  const closing = await prisma.monthClosing.upsert({
    where: { userId_year_month: { userId, year, month } },
    update: {
      status,
      classification,
      balance: facts.balance,
      received: facts.received,
      paid: facts.paid,
      pendingExpense: facts.pendingExpense,
      pendingIncome: facts.pendingIncome,
      message,
      origin,
    },
    create: {
      userId,
      year,
      month,
      status,
      classification,
      balance: facts.balance,
      received: facts.received,
      paid: facts.paid,
      pendingExpense: facts.pendingExpense,
      pendingIncome: facts.pendingIncome,
      message,
      origin,
    },
  });

  await syncClosingAlert(closing);
  return closing;
}

export async function ensureMonthClosing(userId: string) {
  const { year, month } = previousMonthUTC(new Date());
  return upsertMonthClosing(userId, year, month);
}

export type VigentClosingInsight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

const HOME_VIEWS_LIMIT = 3;

export async function getVigentMonthClosing(userId: string): Promise<VigentClosingInsight | null> {
  const closing = await prisma.monthClosing.findFirst({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
  if (!closing) return null;

  if (closing.views >= HOME_VIEWS_LIMIT) return null;

  await prisma.monthClosing.update({
    where: { id: closing.id },
    data: { views: { increment: 1 } },
  });

  const tone =
    closing.status === "PENDENTE"
      ? "attention"
      : closing.classification === MonthClosingClassification.POSITIVO
        ? "positive"
        : closing.classification === MonthClosingClassification.NEGATIVO
          ? "attention"
          : "neutral";

  return {
    title: `Fechamento de ${MONTH_NAMES[closing.month - 1]}`,
    message: closing.message,
    tone,
  };
}
