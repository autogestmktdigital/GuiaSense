import {
  MonthClosingClassification,
  PrismaClient,
  TransactionType,
} from "@prisma/client";

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

export type Trend = "melhorou" | "piorou" | "estavel" | "sem_historico";

export type DeviationCategory = {
  categoryId: string;
  categoryName: string;
  gasto: number;
  media: number;
  diferenca: number;
  percentual: number;
};

export type ClosingFacts = {
  year: number;
  month: number;
  yearMonth: string;
  monthName: string;
  received: number;
  paid: number;
  balance: number;
  pendingExpense: number;
  pendingIncome: number;
  hasPending: boolean;
  classification: MonthClosingClassification | null;
  history: {
    hasPrevious: boolean;
    previousYearMonth: string | null;
    previousBalance: number | null;
    previousClassification: MonthClosingClassification | null;
    difference: number | null;
    trend: Trend;
  };
  streak: Record<MonthClosingClassification, number>;
  deviation: {
    hasData: boolean;
    main: DeviationCategory | null;
    categories: DeviationCategory[];
  };
  previousMessages: string[];
};

function monthStart(year: number, month: number): Date {
  return new Date(Date.UTC(year, month - 1, 1));
}

function previousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

function key(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function toNumber(value: { amount: unknown } | null | undefined): number {
  return Number(value?.amount || 0);
}

async function sumPaidByType(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
  type: TransactionType,
  paid: boolean,
): Promise<number> {
  const start = monthStart(year, month);
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      type,
      paid,
      date: { gte: start, lt: monthStart(year, month + 1) },
    },
    _sum: { amount: true },
  });
  return Number(result._sum.amount || 0);
}

async function computeStreak(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
  own: MonthClosingClassification | null,
): Promise<Record<MonthClosingClassification, number>> {
  const counts: Record<MonthClosingClassification, number> = {
    POSITIVO: 0,
    EQUILIBRADO: 0,
    NEGATIVO: 0,
  };

  const closings = await prisma.monthClosing.findMany({
    where: { userId, status: "FECHADO", classification: { not: null } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: { year: true, month: true, classification: true },
  });
  if (closings.length === 0) return counts;

  let ref = own;
  let cursor = previousMonth(year, month);
  if (!ref) {
    const prev = closings.find(
      (c) => c.year < year || (c.year === year && c.month < month),
    );
    if (!prev || !prev.classification) return counts;
    ref = prev.classification;
    cursor = { year: prev.year, month: prev.month };
  } else {
    counts[ref] = 1;
  }

  let guard = 0;
  while (guard < 72) {
    const match = closings.find((c) => c.year === cursor.year && c.month === cursor.month);
    if (!match || !match.classification || match.classification !== ref) break;
    if (!(match.year === year && match.month === month)) {
      counts[match.classification] += 1;
    }
    cursor = previousMonth(cursor.year, cursor.month);
    guard += 1;
  }

  return counts;
}

async function computeDeviation(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
): Promise<ClosingFacts["deviation"]> {
  const empty: ClosingFacts["deviation"] = {
    hasData: false,
    main: null,
    categories: [],
  };

  const threeMonths: { year: number; month: number }[] = [];
  let cursor = previousMonth(year, month);
  for (let i = 0; i < 3; i += 1) {
    threeMonths.push(cursor);
    cursor = previousMonth(cursor.year, cursor.month);
  }

  const oldest = threeMonths[threeMonths.length - 1];
  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      paid: true,
      date: { gte: monthStart(oldest.year, oldest.month), lt: monthStart(year, month) },
    },
    select: { categoryId: true, amount: true, date: true },
  });
  if (rows.length === 0) return empty;

  const monthsWithData = new Set<string>();
  const byCategory = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const k = key(row.date.getUTCFullYear(), row.date.getUTCMonth() + 1);
    monthsWithData.add(k);
    let months = byCategory.get(row.categoryId);
    if (!months) {
      months = new Map<string, number>();
      byCategory.set(row.categoryId, months);
    }
    months.set(k, (months.get(k) || 0) + Number(row.amount));
  }

  if (monthsWithData.size < 2) return empty;

  const currentByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: TransactionType.EXPENSE,
      paid: true,
      date: { gte: monthStart(year, month), lt: monthStart(year, month + 1) },
    },
    _sum: { amount: true },
  });

  const categories: DeviationCategory[] = [];
  for (const [categoryId, months] of byCategory) {
    const total = Array.from(months.values()).reduce((a, b) => a + b, 0);
    const media = total / months.size;
    const gastoRow = currentByCategory.find((r) => r.categoryId === categoryId);
    const gasto = Number(gastoRow?._sum.amount || 0);
    if (gasto <= media || media <= 0) continue;

    const diferenca = gasto - media;
    const percentual = (diferenca / media) * 100;
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    categories.push({
      categoryId,
      categoryName: category?.name ?? "Essa categoria",
      gasto: round2(gasto),
      media: round2(media),
      diferenca: round2(diferenca),
      percentual: round2(percentual),
    });
  }

  categories.sort((a, b) => b.diferenca - a.diferenca);
  return {
    hasData: true,
    main: categories[0] ?? null,
    categories,
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function buildClosingFacts(
  prisma: PrismaClient,
  userId: string,
  year: number,
  month: number,
): Promise<ClosingFacts> {
  const [incomePaid, incomePending, expensePaid, expensePending, streak, deviation] =
    await Promise.all([
      sumPaidByType(prisma, userId, year, month, TransactionType.INCOME, true),
      sumPaidByType(prisma, userId, year, month, TransactionType.INCOME, false),
      sumPaidByType(prisma, userId, year, month, TransactionType.EXPENSE, true),
      sumPaidByType(prisma, userId, year, month, TransactionType.EXPENSE, false),
      computeStreak(prisma, userId, year, month, null),
      computeDeviation(prisma, userId, year, month),
    ]);

  const received = round2(incomePaid);
  const pendingIncome = round2(incomePending);
  const paid = round2(expensePaid);
  const pendingExpense = round2(expensePending);
  const balance = round2(received - paid);
  const hasPending = pendingExpense > 0 || pendingIncome > 0;

  const classification: MonthClosingClassification | null = hasPending
    ? null
    : balance >= 50.01
      ? MonthClosingClassification.POSITIVO
      : balance <= -50.01
        ? MonthClosingClassification.NEGATIVO
        : MonthClosingClassification.EQUILIBRADO;

  const ownStreak = classification
    ? await computeStreak(prisma, userId, year, month, classification)
    : streak;

  const previous = await prisma.monthClosing.findFirst({
    where: {
      userId,
      status: "FECHADO",
      OR: [
        { year: { lt: year } },
        { year, month: { lt: month } },
      ],
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    select: { year: true, month: true, balance: true, classification: true },
  });

  const previousBalance = previous ? Number(previous.balance) : null;
  const difference =
    previousBalance !== null ? round2(balance - previousBalance) : null;
  const trend: Trend = !previous
    ? "sem_historico"
    : difference === null
      ? "sem_historico"
      : difference > 0.01
        ? "melhorou"
        : difference < -0.01
          ? "piorou"
          : "estavel";

  const previousMessages = (
    await prisma.monthClosing.findMany({
      where: { userId, NOT: { year, month } },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 3,
      select: { message: true, status: true },
    })
  ).map((p) => p.message);

  return {
    year,
    month,
    yearMonth: key(year, month),
    monthName: MONTH_NAMES[month - 1],
    received,
    paid,
    balance,
    pendingExpense,
    pendingIncome,
    hasPending,
    classification,
    history: {
      hasPrevious: Boolean(previous),
      previousYearMonth: previous ? key(previous.year, previous.month) : null,
      previousBalance,
      previousClassification: previous?.classification ?? null,
      difference,
      trend,
    },
    streak: ownStreak,
    deviation,
    previousMessages,
  };
}
