import {
  AlertSeverity,
  AlertType,
  PrismaClient,
  TransactionType,
} from "@prisma/client";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function monthRange(yearMonth: string): { start: Date; end: Date } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function previousYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  date.setUTCMonth(date.getUTCMonth() - 1);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function sumExpensesByCategory(prisma: PrismaClient, userId: string, yearMonth: string) {
  const { start, end } = monthRange(yearMonth);
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId,
      type: TransactionType.EXPENSE,
      date: { gte: start, lt: end },
    },
    _sum: { amount: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row._sum.amount) map.set(row.categoryId, Number(row._sum.amount));
  }
  return map;
}

async function sumByType(prisma: PrismaClient, userId: string, yearMonth: string, type: TransactionType) {
  const { start, end } = monthRange(yearMonth);
  const rows = await prisma.transaction.aggregate({
    where: { userId, type, date: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return Number(rows._sum.amount || 0);
}

export async function runAlertEngine(prisma: PrismaClient, userId: string): Promise<void> {
  await prisma.alert.deleteMany({
    where: { userId, status: "ACTIVE", type: { not: AlertType.FECHAMENTO_MENSAL } },
  });

  const month = currentYearMonth();
  const prevMonth = previousYearMonth(month);

  const spentByCategory = await sumExpensesByCategory(prisma, userId, month);
  const prevSpentByCategory = await sumExpensesByCategory(prisma, userId, prevMonth);

  const totalExpenses = await sumByType(prisma, userId, month, TransactionType.EXPENSE);
  const prevTotalExpenses = await sumByType(prisma, userId, prevMonth, TransactionType.EXPENSE);
  const totalIncome = await sumByType(prisma, userId, month, TransactionType.INCOME);
  const prevTotalIncome = await sumByType(prisma, userId, prevMonth, TransactionType.INCOME);

  const alerts: {
    type: AlertType;
    severity: AlertSeverity;
    message: string;
  }[] = [];

  for (const [categoryId, spent] of spentByCategory) {
    const prevSpent = prevSpentByCategory.get(categoryId) || 0;
    if (prevSpent > 0 && spent > prevSpent) {
      const increase = ((spent - prevSpent) / prevSpent) * 100;
      if (increase >= 30 && spent - prevSpent >= 50) {
        const category = await prisma.category.findUnique({ where: { id: categoryId } });
        alerts.push({
          type: AlertType.CATEGORY_INCREASE,
          severity: AlertSeverity.WARNING,
          message: `Seus gastos com ${category?.name ?? "essa categoria"} aumentaram ${Math.round(increase)}% em relação ao mês anterior.`,
        });
      }
    }
  }

  if (prevTotalExpenses > 0 && totalExpenses > prevTotalExpenses) {
    const increase = ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100;
    if (increase >= 20) {
      alerts.push({
        type: AlertType.EXPENSE_INCREASE,
        severity: AlertSeverity.WARNING,
        message: `Suas despesas aumentaram ${Math.round(increase)}% em relação ao mês anterior (${brl.format(prevTotalExpenses)} → ${brl.format(totalExpenses)}).`,
      });
    }
  }

  if (prevTotalIncome > 0 && totalIncome < prevTotalIncome) {
    const decrease = ((prevTotalIncome - totalIncome) / prevTotalIncome) * 100;
    if (decrease >= 20) {
      alerts.push({
        type: AlertType.INCOME_DECREASE,
        severity: AlertSeverity.INFO,
        message: `Suas receitas caíram ${Math.round(decrease)}% em relação ao mês anterior.`,
      });
    }
  }

  if (alerts.length > 0) {
    await prisma.alert.createMany({
      data: alerts.map((alert) => ({ userId, ...alert })),
    });
  }
}
