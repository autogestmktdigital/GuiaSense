import {
  AlertOrigin,
  AlertSeverity,
  AlertStatus,
  AlertType,
  PrismaClient,
  TransactionType,
} from "@prisma/client";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const MONITORED_SUBCATEGORIES: Record<string, string[]> = {
  Alimentação: ["Supermercado"],
  Moradia: ["Aluguel", "Condomínio", "Água", "Energia", "Gás", "Internet/TV", "Telefone"],
  Transporte: ["Combustível", "Seguro"],
  Saúde: ["Plano de saúde", "Academia"],
  Educação: ["Escola/Faculdade"],
  "Lazer e Assinaturas": ["Assinaturas digitais"],
  "Financeiro e Impostos": ["Empréstimos", "Financiamentos"],
};

const MONITORED_SUBCATEGORY_SET = new Set(Object.values(MONITORED_SUBCATEGORIES).flat());

const SUBCATEGORY_CATEGORY = new Map<string, string>();
for (const [category, subs] of Object.entries(MONITORED_SUBCATEGORIES)) {
  for (const sub of subs) SUBCATEGORY_CATEGORY.set(sub, category);
}

export type VigentOverdueInsight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

function monthRange(yearMonth: string): { start: Date; end: Date } {
  const [year, month] = yearMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

function engineNow(): Date {
  const override = process.env.OVERDUE_TEST_NOW;
  return override ? new Date(override) : new Date();
}

function todayUtcStart(now: Date = engineNow()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function daysBetween(start: Date, end: Date): number {
  const a = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const b = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.round((a - b) / (24 * 60 * 60 * 1000));
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
    where: {
      userId,
      status: "ACTIVE",
      type: { notIn: [AlertType.FECHAMENTO_MENSAL, AlertType.CONTA_ATRASADA, AlertType.RECEBIMENTO_ATRASADO, AlertType.VARIACAO_SUBCATEGORIA, AlertType.VARIACAO_CATEGORIA] },
    },
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
      data: alerts.map((alert) => ({ userId, origin: AlertOrigin.BACKEND, ...alert })),
    });
  }

  await syncOverdueAlerts(prisma, userId);
  await syncRecebimentoAtrasadoAlerts(prisma, userId);
  await syncSubcategoryVariationAlerts(prisma, userId);
  await syncCategoryVariationAlerts(prisma, userId);
}

type OverdueTransaction = {
  id: string;
  date: Date;
  subcategory: string | null;
  description: string;
};

function overdueLabel(transaction: OverdueTransaction): string {
  const subcategory = transaction.subcategory?.trim();
  const description = transaction.description.trim();
  if (subcategory) return subcategory;
  if (description) return description;
  return "essa conta";
}

function overdueMessage(transactions: OverdueTransaction[], today: Date): string {
  if (transactions.length > 1) {
    return `Você tem ${transactions.length} contas vencidas há mais de 2 dias que ainda estão em aberto. Vale conferir esses pagamentos.`;
  }

  const transaction = transactions[0];
  const label = overdueLabel(transaction);
  const days = daysBetween(today, transaction.date);
  const variants = [
    `Atenção: a conta de ${label} venceu há ${days} dias e ainda está em aberto. Vale conferir se o pagamento já foi realizado.`,
    `A conta de ${label} está vencida há ${days} dias e continua em aberto. Vale conferir esse pagamento.`,
    `O pagamento de ${label} venceu há ${days} dias e ainda consta como pendente.`,
  ];
  const hash = Array.from(transaction.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export async function syncOverdueAlerts(prisma: PrismaClient, userId: string): Promise<void> {
  const today = todayUtcStart();

  const candidates = await prisma.transaction.findMany({
    where: { userId, type: TransactionType.EXPENSE, paid: false, date: { lt: today } },
    select: { id: true, date: true, subcategory: true, description: true },
    orderBy: { date: "asc" },
  });

  const triggers: OverdueTransaction[] = candidates.filter(
    (transaction) => daysBetween(today, transaction.date) > 2,
  );

  const existing = await prisma.alert.findMany({
    where: { userId, type: AlertType.CONTA_ATRASADA },
  });

  if (triggers.length === 0) {
    if (existing.length > 0) {
      const ids = existing.map((alert) => alert.id);
      await prisma.alert.deleteMany({ where: { id: { in: ids } } });
    }
    return;
  }

  const message = overdueMessage(triggers, today);
  const transactionIds = triggers.map((transaction) => transaction.id);

  if (existing.length > 0) {
    const primary = existing[0];
    await prisma.alert.update({
      where: { id: primary.id },
      data: { message, transactionIds, resolvedAt: null },
    });
    if (existing.length > 1) {
      const duplicates = existing.slice(1).map((alert) => alert.id);
      await prisma.alert.deleteMany({ where: { id: { in: duplicates } } });
    }
    return;
  }

  await prisma.alert.create({
    data: {
      userId,
      type: AlertType.CONTA_ATRASADA,
      severity: AlertSeverity.DANGER,
      message,
      status: AlertStatus.ACTIVE,
      origin: AlertOrigin.BACKEND,
      transactionIds,
      homeDisplayUntil: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function getVigentOverdueInsight(
  prisma: PrismaClient,
  userId: string,
): Promise<VigentOverdueInsight | null> {
  const alert = await prisma.alert.findFirst({
    where: {
      userId,
      type: AlertType.CONTA_ATRASADA,
      homeDisplayUntil: { gt: engineNow() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!alert) return null;

  const count = Array.isArray(alert.transactionIds) ? alert.transactionIds.length : 0;
  return {
    title: count > 1 ? "Contas em atraso" : "Conta em atraso",
    message: alert.message,
    tone: "attention",
  };
}

type OverdueReceivable = {
  id: string;
  date: Date;
  subcategory: string | null;
  description: string;
};

function receivableLabel(receivable: OverdueReceivable): string {
  const subcategory = receivable.subcategory?.trim();
  const description = receivable.description.trim();
  if (subcategory) return subcategory;
  if (description) return description;
  return "esse recebimento";
}

function receivableMessage(receivables: OverdueReceivable[], today: Date): string {
  if (receivables.length > 1) {
    return `Você tem ${receivables.length} recebimentos previstos há mais de 2 dias que ainda estão em aberto. Vale conferir esses valores.`;
  }

  const receivable = receivables[0];
  const label = receivableLabel(receivable);
  const date = receivable.date.toISOString().slice(0, 10).split("-").reverse().join("/");
  const variants = [
    `O recebimento de ${label} previsto para ${date} ainda está em aberto. Vale conferir se esse valor já foi recebido.`,
    `O recebimento previsto para ${date} está em aberto há mais de 2 dias. Vale conferir se esse valor já entrou.`,
    `O recebimento de ${label} continua como A receber desde ${date}. Vale conferir se esse valor já foi recebido.`,
  ];
  const hash = Array.from(receivable.id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export async function syncRecebimentoAtrasadoAlerts(prisma: PrismaClient, userId: string): Promise<void> {
  const today = todayUtcStart();

  const candidates = await prisma.transaction.findMany({
    where: { userId, type: TransactionType.INCOME, paid: false, date: { lt: today } },
    select: { id: true, date: true, subcategory: true, description: true },
    orderBy: { date: "asc" },
  });

  const triggers: OverdueReceivable[] = candidates.filter(
    (receivable) => daysBetween(today, receivable.date) > 2,
  );

  const existing = await prisma.alert.findMany({
    where: { userId, type: AlertType.RECEBIMENTO_ATRASADO },
  });

  if (triggers.length === 0) {
    if (existing.length > 0) {
      const ids = existing.map((alert) => alert.id);
      await prisma.alert.deleteMany({ where: { id: { in: ids } } });
    }
    return;
  }

  const message = receivableMessage(triggers, today);
  const transactionIds = triggers.map((receivable) => receivable.id);

  if (existing.length > 0) {
    const primary = existing[0];
    await prisma.alert.update({
      where: { id: primary.id },
      data: { message, transactionIds, resolvedAt: null },
    });
    if (existing.length > 1) {
      const duplicates = existing.slice(1).map((alert) => alert.id);
      await prisma.alert.deleteMany({ where: { id: { in: duplicates } } });
    }
    return;
  }

  await prisma.alert.create({
    data: {
      userId,
      type: AlertType.RECEBIMENTO_ATRASADO,
      severity: AlertSeverity.WARNING,
      message,
      status: AlertStatus.ACTIVE,
      origin: AlertOrigin.BACKEND,
      transactionIds,
      homeDisplayUntil: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
  });
}

export async function getVigentRecebimentoInsight(
  prisma: PrismaClient,
  userId: string,
): Promise<VigentOverdueInsight | null> {
  const alert = await prisma.alert.findFirst({
    where: {
      userId,
      type: AlertType.RECEBIMENTO_ATRASADO,
      homeDisplayUntil: { gt: engineNow() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!alert) return null;

  const count = Array.isArray(alert.transactionIds) ? alert.transactionIds.length : 0;
  return {
    title: count > 1 ? "Recebimentos em atraso" : "Recebimento em atraso",
    message: alert.message,
    tone: "attention",
  };
}

type SubcategoryVariation = {
  category: string;
  subcategory: string;
  year: number;
  month: number;
  historicalMonths: string[];
  historicalAverage: number;
  currentAmount: number;
  difference: number;
  percent: number;
};

const HISTORY_WINDOW_MONTHS = 36;

function monthKeyOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function centsOf(value: number): number {
  return Math.round(value * 100);
}

async function computeSubcategoryVariations(
  prisma: PrismaClient,
  userId: string,
): Promise<SubcategoryVariation[]> {
  const now = engineNow();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const currentStart = new Date(Date.UTC(year, month - 1, 1));
  const currentEnd = new Date(Date.UTC(year, month, 1));
  const historyStart = new Date(Date.UTC(year, month - 1 - HISTORY_WINDOW_MONTHS, 1));

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      subcategory: { in: Array.from(MONITORED_SUBCATEGORY_SET) },
      date: { gte: historyStart, lt: currentEnd },
    },
    select: { date: true, subcategory: true, amount: true },
  });

  const currentTotals = new Map<string, number>();
  const historyByMonth = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const subcategory = row.subcategory;
    if (!subcategory) continue;
    const cents = centsOf(Number(row.amount));
    if (row.date >= currentStart) {
      currentTotals.set(subcategory, (currentTotals.get(subcategory) ?? 0) + cents);
    } else {
      const key = monthKeyOf(row.date);
      let monthMap = historyByMonth.get(key);
      if (!monthMap) {
        monthMap = new Map();
        historyByMonth.set(key, monthMap);
      }
      monthMap.set(subcategory, (monthMap.get(subcategory) ?? 0) + cents);
    }
  }

  const results: SubcategoryVariation[] = [];

  for (const subcategory of MONITORED_SUBCATEGORY_SET) {
    const current = currentTotals.get(subcategory) ?? 0;
    if (current <= 0) continue;

    const totals: number[] = [];
    const months: string[] = [];
    let y = year;
    let m = month - 1;
    let guard = 0;

    while (totals.length < 3 && guard < HISTORY_WINDOW_MONTHS) {
      guard++;
      if (m <= 0) {
        m = 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const total = historyByMonth.get(key)?.get(subcategory) ?? 0;
      if (total > 0) {
        totals.push(total);
        months.push(key);
      }
      m -= 1;
    }

    if (totals.length < 3) continue;

    const historicalAverageCents = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const differenceCents = current - historicalAverageCents;
    if (historicalAverageCents <= 0 || differenceCents <= 0) continue;

    const percent = (differenceCents * 100) / historicalAverageCents;
    if (percent < 20) continue;
    if (differenceCents < 2000) continue;

    results.push({
      category: SUBCATEGORY_CATEGORY.get(subcategory) ?? "Outras Despesas",
      subcategory,
      year,
      month,
      historicalMonths: months,
      historicalAverage: historicalAverageCents / 100,
      currentAmount: current / 100,
      difference: differenceCents / 100,
      percent,
    });
  }

  return results;
}

function variationMessage(variation: SubcategoryVariation): string {
  const diff = brl.format(variation.difference);
  const pct = Math.round(variation.percent);
  const variants = [
    `Sua conta de ${variation.subcategory} deste mês está ${diff} acima da média dos últimos 3 meses. Vale conferir esse valor.`,
    `O valor cadastrado em ${variation.subcategory} neste mês está ${pct}% acima da sua média dos últimos 3 meses. Vale dar uma conferida.`,
    `Seus gastos com ${variation.subcategory} neste mês já estão ${diff} acima da média dos últimos 3 meses.`,
    `Neste mês, os gastos com ${variation.subcategory} estão ${pct}% acima da média dos últimos 3 meses.`,
  ];
  const hash = Array.from(variation.subcategory).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export async function syncSubcategoryVariationAlerts(prisma: PrismaClient, userId: string): Promise<void> {
  const variations = await computeSubcategoryVariations(prisma, userId);

  const existing = await prisma.alert.findMany({
    where: { userId, type: AlertType.VARIACAO_SUBCATEGORIA },
  });

  const existingByKey = new Map<string, (typeof existing)[number]>();

  for (const alert of existing) {
    const payload = (alert.data as { subcategory?: string; year?: number; month?: number } | null) ?? null;
    const key =
      payload && typeof payload.subcategory === "string" && typeof payload.year === "number" && typeof payload.month === "number"
        ? `${payload.year}-${payload.month}-${payload.subcategory}`
        : alert.id;
    existingByKey.set(key, alert);
  }

  for (const variation of variations) {
    const key = `${variation.year}-${variation.month}-${variation.subcategory}`;
    const message = variationMessage(variation);
    const payload = {
      category: variation.category,
      subcategory: variation.subcategory,
      year: variation.year,
      month: variation.month,
      historicalMonths: variation.historicalMonths,
      historicalAverage: variation.historicalAverage,
      currentAmount: variation.currentAmount,
      difference: variation.difference,
      percent: variation.percent,
    };

    const current = existingByKey.get(key);
    if (current) {
      await prisma.alert.update({ where: { id: current.id }, data: { message, data: payload } });
    } else {
      await prisma.alert.create({
        data: {
          userId,
          type: AlertType.VARIACAO_SUBCATEGORIA,
          severity: AlertSeverity.WARNING,
          message,
          status: AlertStatus.ACTIVE,
          origin: AlertOrigin.BACKEND,
          data: payload,
          homeDisplayUntil: new Date(engineNow().getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}

export async function getVigentVariationInsights(
  prisma: PrismaClient,
  userId: string,
): Promise<VigentOverdueInsight[]> {
  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      type: AlertType.VARIACAO_SUBCATEGORIA,
      homeDisplayUntil: { gt: engineNow() },
    },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((alert) => ({
    title: "Seus gastos estão maiores que o normal",
    message: alert.message,
    tone: "attention",
  }));
}

type CategoryVariation = {
  category: string;
  year: number;
  month: number;
  historicalMonths: string[];
  historicalAverage: number;
  currentAmount: number;
  difference: number;
  percent: number;
  excludedSubcategories: string[];
};

const CATEGORY_MIN_PERCENT = 20;
const CATEGORY_MIN_DIFFERENCE_CENTS = 5000;

const ANALYZED_CATEGORIES = [
  "Alimentação",
  "Moradia",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer e Assinaturas",
  "Compras e Cuidados",
  "Financeiro e Impostos",
  "Outras Despesas",
];

async function computeCategoryVariations(
  prisma: PrismaClient,
  userId: string,
): Promise<CategoryVariation[]> {
  const now = engineNow();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  const currentStart = new Date(Date.UTC(year, month - 1, 1));
  const currentEnd = new Date(Date.UTC(year, month, 1));
  const historyStart = new Date(Date.UTC(year, month - 1 - HISTORY_WINDOW_MONTHS, 1));

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      type: TransactionType.EXPENSE,
      date: { gte: historyStart, lt: currentEnd },
    },
    select: { date: true, subcategory: true, amount: true, categoryId: true },
  });

  const categories = await prisma.category.findMany({
    where: { type: TransactionType.EXPENSE },
    select: { id: true, name: true },
  });
  const categoryNameById = new Map<string, string>();
  for (const category of categories) categoryNameById.set(category.id, category.name);

  const currentTotals = new Map<string, number>();
  const historyByMonth = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const categoryName = categoryNameById.get(row.categoryId);
    if (!categoryName || !ANALYZED_CATEGORIES.includes(categoryName)) continue;

    const monitoredSubs = MONITORED_SUBCATEGORIES[categoryName] ?? [];
    const subcategory = row.subcategory;
    if (subcategory && monitoredSubs.includes(subcategory)) continue;

    const cents = centsOf(Number(row.amount));
    if (row.date >= currentStart) {
      currentTotals.set(categoryName, (currentTotals.get(categoryName) ?? 0) + cents);
    } else {
      const key = monthKeyOf(row.date);
      let monthMap = historyByMonth.get(key);
      if (!monthMap) {
        monthMap = new Map<string, number>();
        historyByMonth.set(key, monthMap);
      }
      monthMap.set(categoryName, (monthMap.get(categoryName) ?? 0) + cents);
    }
  }

  const results: CategoryVariation[] = [];

  for (const categoryName of ANALYZED_CATEGORIES) {
    const current = currentTotals.get(categoryName) ?? 0;
    if (current <= 0) continue;

    const totals: number[] = [];
    const months: string[] = [];
    let y = year;
    let m = month - 1;
    let guard = 0;

    while (totals.length < 3 && guard < HISTORY_WINDOW_MONTHS) {
      guard++;
      if (m <= 0) {
        m = 12;
        y -= 1;
      }
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const total = historyByMonth.get(key)?.get(categoryName) ?? 0;
      if (total > 0) {
        totals.push(total);
        months.push(key);
      }
      m -= 1;
    }

    if (totals.length < 3) continue;

    const historicalAverageCents = Math.round(totals.reduce((a, b) => a + b, 0) / totals.length);
    const differenceCents = current - historicalAverageCents;
    if (historicalAverageCents <= 0 || differenceCents <= 0) continue;

    const percent = (differenceCents * 100) / historicalAverageCents;
    if (percent < CATEGORY_MIN_PERCENT) continue;
    if (differenceCents <= CATEGORY_MIN_DIFFERENCE_CENTS) continue;

    results.push({
      category: categoryName,
      year,
      month,
      historicalMonths: months,
      historicalAverage: historicalAverageCents / 100,
      currentAmount: current / 100,
      difference: differenceCents / 100,
      percent,
      excludedSubcategories: MONITORED_SUBCATEGORIES[categoryName] ?? [],
    });
  }

  return results;
}

function categoryVariationMessage(variation: CategoryVariation): string {
  const diff = brl.format(variation.difference);
  const pct = Math.round(variation.percent);
  const variants = [
    `Seus gastos com ${variation.category} neste mês estão ${diff} acima da média dos últimos 3 meses. Vale acompanhar essa diferença.`,
    `Os gastos com ${variation.category} neste mês estão ${pct}% acima da sua média dos últimos 3 meses. Vale acompanhar essa diferença.`,
    `Neste mês, seus gastos com ${variation.category} já estão ${diff} acima da média recente. Vale acompanhar essa diferença.`,
  ];
  const hash = Array.from(variation.category).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[hash % variants.length];
}

export async function syncCategoryVariationAlerts(prisma: PrismaClient, userId: string): Promise<void> {
  const variations = await computeCategoryVariations(prisma, userId);

  const existing = await prisma.alert.findMany({
    where: { userId, type: AlertType.VARIACAO_CATEGORIA },
  });

  const existingByKey = new Map<string, (typeof existing)[number]>();
  for (const alert of existing) {
    const payload = (alert.data as { category?: string; year?: number; month?: number } | null) ?? null;
    const key =
      payload && typeof payload.category === "string" && typeof payload.year === "number" && typeof payload.month === "number"
        ? `${payload.year}-${payload.month}-${payload.category}`
        : alert.id;
    existingByKey.set(key, alert);
  }

  const targets = new Map<string, CategoryVariation>();
  for (const variation of variations) {
    const key = `${variation.year}-${variation.month}-${variation.category}`;
    targets.set(key, variation);
  }

  for (const [key, alert] of existingByKey) {
    if (!targets.has(key)) {
      await prisma.alert.delete({ where: { id: alert.id } });
    }
  }

  for (const variation of variations) {
    const key = `${variation.year}-${variation.month}-${variation.category}`;
    const message = categoryVariationMessage(variation);
    const payload = {
      category: variation.category,
      year: variation.year,
      month: variation.month,
      historicalMonths: variation.historicalMonths,
      historicalAverage: variation.historicalAverage,
      currentAmount: variation.currentAmount,
      difference: variation.difference,
      percent: variation.percent,
      excludedSubcategories: variation.excludedSubcategories,
    };

    const current = existingByKey.get(key);
    if (current) {
      await prisma.alert.update({ where: { id: current.id }, data: { message, data: payload } });
    } else {
      await prisma.alert.create({
        data: {
          userId,
          type: AlertType.VARIACAO_CATEGORIA,
          severity: AlertSeverity.WARNING,
          message,
          status: AlertStatus.ACTIVE,
          origin: AlertOrigin.BACKEND,
          data: payload,
          homeDisplayUntil: new Date(engineNow().getTime() + 3 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
}

export async function getVigentCategoryVariationInsights(
  prisma: PrismaClient,
  userId: string,
): Promise<VigentOverdueInsight[]> {
  const alerts = await prisma.alert.findMany({
    where: {
      userId,
      type: AlertType.VARIACAO_CATEGORIA,
      homeDisplayUntil: { gt: engineNow() },
    },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((alert) => {
    const payload = (alert.data as { category?: string } | null) ?? null;
    return {
      title: `Gastos com ${payload?.category ?? "sua categoria"} acima do normal`,
      message: alert.message,
      tone: "attention",
    };
  });
}
