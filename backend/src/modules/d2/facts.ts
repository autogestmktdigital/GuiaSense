import {
  PrismaClient,
  TransactionType,
  MonthProjection,
  MonthProjectionClassification,
  MonthProjectionD2Variation,
} from "@prisma/client";
import { MONTH_NAMES, daysInMonth, currentMonthUTC } from "../d5/facts";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function money(value: number): string {
  return brl.format(value);
}

export type D2Classification = MonthProjectionClassification;

export type D2Variation = MonthProjectionD2Variation;

export type D2Facts = {
  year: number;
  month: number;
  yearMonth: string;
  monthName: string;
  analyzedAt: Date;
  lastDay: number;
  daysLeft: number;
  received: number;
  pendingIncome: number;
  paid: number;
  pendingExpense: number;
  balance: number;
  projectedBalance: number;
  classification: D2Classification;
  d5Balance: number;
  d5ProjectedBalance: number;
  d5Classification: D2Classification;
  projectionDifference: number;
  variationType: D2Variation;
  classificationChanged: boolean;
  paidSinceD5: number;
  receivedSinceD5: number;
  newPendingExpense: number;
  newPendingIncome: number;
  balanceChange: number;
  relevantFacts: string[];
};

const CLASS_LABEL: Record<D2Classification, string> = {
  PREVISAO_POSITIVA: "positiva",
  PREVISAO_EQUILIBRADA: "equilibrada",
  PREVISAO_NEGATIVA: "negativa",
};

export function d2DayOfMonth(year: number, month: number): number {
  return daysInMonth(year, month) - 2;
}

export function isD2Day(now: Date, year: number, month: number): boolean {
  return now.getUTCDate() === d2DayOfMonth(year, month);
}

export function systemNow(): Date {
  const override = process.env.D2_TEST_NOW;
  return override ? new Date(override) : new Date();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function atUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

function monthRange(year: number, month: number): { start: Date; end: Date } {
  return {
    start: atUTC(year, month, 1),
    end: atUTC(year, month, daysInMonth(year, month) + 1),
  };
}

async function sumByPaid(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
  type: TransactionType,
  paid: boolean,
): Promise<number> {
  const { start, end } = monthRange(year, month);
  const result = await prisma.transaction.aggregate({
    where: { userId, type, paid, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount || 0);
}

export function classifyProjection(projectedBalance: number): D2Classification {
  return projectedBalance >= 50.01
    ? "PREVISAO_POSITIVA"
    : projectedBalance <= -50.01
      ? "PREVISAO_NEGATIVA"
      : "PREVISAO_EQUILIBRADA";
}

export function classifyVariation(difference: number): D2Variation {
  return difference >= 50.01
    ? "MELHOROU"
    : difference <= -50.01
      ? "PIOROU"
      : "PRATICAMENTE_IGUAL";
}

export async function buildD2Facts(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
  now: Date,
  d5: MonthProjection,
): Promise<D2Facts> {
  const [incomePaid, incomePending, expensePaid, expensePending] = await Promise.all([
    sumByPaid(prisma, userId, year, month, TransactionType.INCOME, true),
    sumByPaid(prisma, userId, year, month, TransactionType.INCOME, false),
    sumByPaid(prisma, userId, year, month, TransactionType.EXPENSE, true),
    sumByPaid(prisma, userId, year, month, TransactionType.EXPENSE, false),
  ]);

  const received = round2(incomePaid);
  const pendingIncome = round2(incomePending);
  const paid = round2(expensePaid);
  const pendingExpense = round2(expensePending);
  const balance = round2(received - paid);
  const projectedBalance = round2(received + pendingIncome - paid - pendingExpense);

  const d5PendingIncome = round2(Number(d5.pendingIncome));
  const d5PendingExpense = round2(Number(d5.pendingExpense));
  const d5Balance = round2(Number(d5.balance));
  const d5ProjectedBalance = round2(Number(d5.projectedBalance));
  const d5Classification: D2Classification = d5.classification;

  const classification = classifyProjection(projectedBalance);
  const classificationChanged = classification !== d5Classification;
  const projectionDifference = round2(projectedBalance - d5ProjectedBalance);
  const variationType = classifyVariation(projectionDifference);

  const aPagarPago = round2(d5PendingExpense - pendingExpense);
  const aReceberRecebido = round2(d5PendingIncome - pendingIncome);
  const novosAPagar = round2(pendingExpense - d5PendingExpense);
  const novosAReceber = round2(pendingIncome - d5PendingIncome);
  const balanceChange = round2(balance - d5Balance);

  const facts: string[] = [];
  if (aPagarPago > 0.01)
    facts.push(`valores que estavam em aberto a pagar foram pagos: ${money(aPagarPago)}`);
  if (aReceberRecebido > 0.01)
    facts.push(`valores que estavam a receber foram recebidos: ${money(aReceberRecebido)}`);
  if (novosAPagar > 0.01)
    facts.push(`novos valores a pagar em aberto surgiram: ${money(novosAPagar)}`);
  if (novosAReceber > 0.01)
    facts.push(`novos valores a receber em aberto surgiram: ${money(novosAReceber)}`);
  if (Math.abs(balanceChange) >= 0.01) {
    facts.push(
      `saldo atual (entradas recebidas menos saídas pagas) ${balanceChange > 0 ? "subiu" : "caiu"} ${money(Math.abs(balanceChange))} em relação à análise anterior`,
    );
  }
  if (classificationChanged) {
    facts.push(
      `a classificação da projeção mudou de ${CLASS_LABEL[d5Classification]} para ${CLASS_LABEL[classification]}`,
    );
  }
  if (projectionDifference >= 50.01) {
    facts.push(
      `saldo previsto aumentou ${money(projectionDifference)} em relação à análise anterior (de ${money(d5ProjectedBalance)} para ${money(projectedBalance)})`,
    );
  } else if (projectionDifference <= -50.01) {
    facts.push(
      `saldo previsto diminuiu ${money(Math.abs(projectionDifference))} em relação à análise anterior (de ${money(d5ProjectedBalance)} para ${money(projectedBalance)})`,
    );
  }
  if (facts.length === 0) {
    facts.push("quase nada mudou entre a análise anterior e agora");
  }

  return {
    year,
    month,
    yearMonth: `${year}-${String(month).padStart(2, "0")}`,
    monthName: MONTH_NAMES[month - 1],
    analyzedAt: now,
    lastDay: daysInMonth(year, month),
    daysLeft: Math.max(0, daysInMonth(year, month) - now.getUTCDate()),
    received,
    pendingIncome,
    paid,
    pendingExpense,
    balance,
    projectedBalance,
    classification,
    d5Balance,
    d5ProjectedBalance,
    d5Classification,
    projectionDifference,
    variationType,
    classificationChanged,
    paidSinceD5: round2(Math.max(0, aPagarPago)),
    receivedSinceD5: round2(Math.max(0, aReceberRecebido)),
    newPendingExpense: round2(Math.max(0, novosAPagar)),
    newPendingIncome: round2(Math.max(0, novosAReceber)),
    balanceChange,
    relevantFacts: facts,
  };
}

export function isEmptyProjectionD2(facts: D2Facts): boolean {
  return (
    facts.received === 0 &&
    facts.paid === 0 &&
    facts.pendingIncome === 0 &&
    facts.pendingExpense === 0
  );
}

export { money };