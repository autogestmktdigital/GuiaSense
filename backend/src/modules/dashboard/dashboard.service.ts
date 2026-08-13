import { TransactionType } from "@prisma/client";
import { prisma } from "../../lib/prisma";

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + delta);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function totalsByType(userId: string, month: string, type: TransactionType) {
  const { start, end } = monthRange(month);
  const result = await prisma.transaction.aggregate({
    where: { userId, type, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount || 0);
}

async function totalsByTypeAndPaid(userId: string, month: string, type: TransactionType) {
  const { start, end } = monthRange(month);
  const rows = await prisma.transaction.groupBy({
    by: ["paid"],
    where: { userId, type, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  const paid = rows.find((r) => r.paid)?._sum.amount || 0;
  const total = rows.reduce((sum, r) => sum + Number(r._sum.amount || 0), 0);
  return { paid: Number(paid), total: Number(total) };
}

export type TopExpensesPeriod = "month" | "quarter" | "semester";

function periodRange(month: string, period: TopExpensesPeriod) {
  const { end } = monthRange(month);
  if (period === "month") {
    return { start: monthRange(month).start, end };
  }
  const back = period === "quarter" ? 2 : 5;
  return { start: monthRange(shiftMonth(month, -back)).start, end };
}

export async function getTopExpenses(userId: string, month: string, period: TopExpensesPeriod) {
  const { start, end } = periodRange(month, period);
  const [rows, totalRow] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  const total = Number(totalRow._sum.amount || 0);
  const topExpenses = await Promise.all(
    rows.map(async (row) => {
      const category = await prisma.category.findUnique({ where: { id: row.categoryId } });
      return {
        categoryId: row.categoryId,
        categoryName: category?.name ?? "Outros",
        icon: category?.icon ?? "tag",
        color: category?.color ?? "#64748B",
        amount: Number(row._sum.amount || 0),
        percent: total > 0 ? Math.round((Number(row._sum.amount || 0) / total) * 100) : 0,
      };
    }),
  );

  return { month, period, total, topExpenses };
}

export async function getCategoryExpenses(
  userId: string,
  month: string,
  period: TopExpensesPeriod,
  categoryId: string,
) {
  const { start, end } = periodRange(month, period);
  const [category, items, totalRow] = await Promise.all([
    prisma.category.findUnique({ where: { id: categoryId } }),
    prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE, categoryId, date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
      select: { id: true, description: true, subcategory: true, amount: true, paid: true, date: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.EXPENSE, categoryId, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);

  return {
    month,
    period,
    categoryId,
    categoryName: category?.name ?? "Outros",
    icon: category?.icon ?? "tag",
    color: category?.color ?? "#64748B",
    total: Number(totalRow._sum.amount || 0),
    items,
  };
}

function todayUtcStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function getUpcomingPayments(userId: string) {
  const today = todayUtcStart();
  const windowEnd = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);
  const select = {
    id: true,
    date: true,
    subcategory: true,
    description: true,
    amount: true,
  } as const;

  const [overdue, upcoming] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE, paid: false, date: { lt: today } },
      orderBy: { date: "asc" },
      select,
    }),
    prisma.transaction.findMany({
      where: { userId, type: TransactionType.EXPENSE, paid: false, date: { gte: today, lt: windowEnd } },
      orderBy: { date: "asc" },
      select,
    }),
  ]);

  const items = [
    ...overdue.map((item) => ({ ...item, amount: Number(item.amount), overdue: true })),
    ...upcoming.map((item) => ({ ...item, amount: Number(item.amount), overdue: false })),
  ];

  return { total: items.length, items };
}

export async function getOverview(userId: string) {
  const month = currentYearMonth();
  const { start, end } = monthRange(month);

  const [incomeData, expenseData] = await Promise.all([
    totalsByTypeAndPaid(userId, month, TransactionType.INCOME),
    totalsByTypeAndPaid(userId, month, TransactionType.EXPENSE),
  ]);

  const income = incomeData.total;
  const expense = expenseData.total;
  const receivedIncome = incomeData.paid;
  const pendingIncome = income - receivedIncome;
  const paidExpense = expenseData.paid;
  const pendingExpense = expense - paidExpense;
  const balance = receivedIncome - paidExpense;
  const projectedBalance = income - expense;

  const [topExpenses, recent, series] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
      take: 6,
    }),
    (async () => {
      const months = Array.from({ length: 12 }, (_, i) => shiftMonth(month, i - 11));
      const out: { month: string; income: number; expense: number }[] = [];
      for (const m of months) {
        const [inc, exp] = await Promise.all([
          totalsByType(userId, m, TransactionType.INCOME),
          totalsByType(userId, m, TransactionType.EXPENSE),
        ]);
        out.push({ month: m, income: inc, expense: exp });
      }
      return out;
    })(),
  ]);

  const top = await Promise.all(
    topExpenses.map(async (row) => {
      const category = await prisma.category.findUnique({ where: { id: row.categoryId } });
      return {
        categoryId: row.categoryId,
        categoryName: category?.name ?? "Outros",
        icon: category?.icon ?? "tag",
        color: category?.color ?? "#64748B",
        amount: Number(row._sum.amount || 0),
        percent: expense > 0 ? Math.round((Number(row._sum.amount || 0) / expense) * 100) : 0,
      };
    }),
  );

  return {
    month,
    totals: {
      income,
      expense,
      balance,
      projectedBalance,
      receivedIncome,
      pendingIncome,
      paidExpense,
      pendingExpense,
    },
    topExpenses: top,
    recent,
    series,
  };
}
