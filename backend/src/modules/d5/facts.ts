import { PrismaClient, TransactionType } from "@prisma/client";

export const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export type ProjectionClassification =
  | "PREVISAO_POSITIVA"
  | "PREVISAO_EQUILIBRADA"
  | "PREVISAO_NEGATIVA";

export type D5Facts = {
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
  classification: ProjectionClassification;
  difference: number;
  relation: "maior" | "menor" | "igual";
  previousMessages: string[];
};

export function currentMonthUTC(now: Date): { year: number; month: number } {
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function atUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function d5Date(year: number, month: number): Date {
  return atUTC(year, month, daysInMonth(year, month) - 5);
}

export function d2Date(year: number, month: number): Date {
  return atUTC(year, month, daysInMonth(year, month) - 2);
}

export function todayInWindow(now: Date, year: number, month: number): boolean {
  return now >= d5Date(year, month) && now < d2Date(year, month);
}

export function systemNow(): Date {
  const override = process.env.D5_TEST_NOW;
  return override ? new Date(override) : new Date();
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
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

export async function buildD5Facts(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
  now: Date,
): Promise<D5Facts> {
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

  const classification: ProjectionClassification =
    projectedBalance >= 50.01
      ? "PREVISAO_POSITIVA"
      : projectedBalance <= -50.01
        ? "PREVISAO_NEGATIVA"
        : "PREVISAO_EQUILIBRADA";

  const difference = round2(projectedBalance - balance);
  const relation: D5Facts["relation"] =
    difference > 0.01 ? "maior" : difference < -0.01 ? "menor" : "igual";

  const previousMessages = (
    await prisma.monthProjection.findMany({
      where: { userId, NOT: { year, month } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 3,
      select: { message: true },
    })
  ).map((p) => p.message);

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
    difference,
    relation,
    previousMessages,
  };
}

export function isEmptyProjection(facts: D5Facts): boolean {
  return (
    facts.received === 0 &&
    facts.paid === 0 &&
    facts.pendingIncome === 0 &&
    facts.pendingExpense === 0
  );
}