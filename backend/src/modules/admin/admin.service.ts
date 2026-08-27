import { prisma } from "../../lib/prisma";

export async function getOverview() {
  const [
    totalUsers,
    usersByAccess,
    usersByRole,
    paymentsByStatus,
    approvedPaymentsLast30d,
    newUsersLast30d,
    totalRevenue,
    revenueCurrentMonth,
    recentUsers,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["accessStatus"], _count: true }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.payment.groupBy({ by: ["status"], _count: true }),
    prisma.payment.count({
      where: { status: "APPROVED", createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.payment.aggregate({ where: { status: "APPROVED" }, _sum: { amountBRL: true } }),
    prisma.payment.aggregate({
      where: {
        status: "APPROVED",
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
      _sum: { amountBRL: true },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        name: true,
        email: true,
        accessStatus: true,
        role: true,
        createdAt: true,
        _count: { select: { transactions: true } },
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, status: true, plan: true, amountBRL: true, createdAt: true, userId: true },
    }),
  ]);

  function groupCounts<T extends string>(rows: { _count: number }[], key: string): Record<string, number> {
    const map: Record<string, number> = {};
    for (const row of rows) {
      const value = (row as never as Record<string, T>)[key];
      map[String(value)] = row._count;
    }
    return map;
  }

  const payerUserIds = Array.from(new Set(recentPayments.map((payment) => payment.userId)));
  const payerUsers = payerUserIds.length
    ? await prisma.user.findMany({
        where: { id: { in: payerUserIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const userNames = new Map(payerUsers.map((user) => [user.id, user.name]));

  return {
    totals: {
      users: totalUsers,
      approvedPaymentsLast30d,
      newUsersLast30d,
      revenue: Number(totalRevenue._sum.amountBRL || 0),
      revenueCurrentMonth: Number(revenueCurrentMonth._sum.amountBRL || 0),
    },
    users: {
      total: totalUsers,
      byAccess: groupCounts(usersByAccess, "accessStatus"),
      byRole: groupCounts(usersByRole, "role"),
    },
    payments: {
      byStatus: groupCounts(paymentsByStatus, "status"),
    },
    recentUsers: recentUsers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      accessStatus: user.accessStatus,
      role: user.role,
      createdAt: user.createdAt,
      transactions: user._count.transactions,
    })),
    recentPayments: recentPayments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      plan: payment.plan,
      amountBRL: Number(payment.amountBRL),
      createdAt: payment.createdAt,
      userName: userNames.get(payment.userId) ?? null,
    })),
  };
}

export async function getRevenueByMonth() {
  const payments = await prisma.payment.findMany({
    where: { status: "APPROVED" },
    select: { amountBRL: true, createdAt: true },
  });

  const byMonth = new Map<string, number>();
  for (const payment of payments) {
    const key = `${payment.createdAt.getFullYear()}-${String(payment.createdAt.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(payment.amountBRL));
  }

  return Array.from(byMonth, ([month, amountBRL]) => ({ month, amountBRL })).sort((a, b) =>
    a.month.localeCompare(b.month),
  );
}

export async function getUsersByMonth() {
  const [users, approvedPayments] = await Promise.all([
    prisma.user.findMany({ select: { createdAt: true } }),
    prisma.payment.findMany({
      where: { status: "APPROVED" },
      select: { userId: true, createdAt: true },
    }),
  ]);

  const byMonth = new Map<string, { newUsers: number; payingUsers: Set<string> }>();
  const monthKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  for (const user of users) {
    const key = monthKey(user.createdAt);
    const entry = byMonth.get(key) ?? { newUsers: 0, payingUsers: new Set() };
    entry.newUsers += 1;
    byMonth.set(key, entry);
  }

  for (const payment of approvedPayments) {
    const key = monthKey(payment.createdAt);
    const entry = byMonth.get(key) ?? { newUsers: 0, payingUsers: new Set() };
    entry.payingUsers.add(payment.userId);
    byMonth.set(key, entry);
  }

  return Array.from(byMonth, ([month, entry]) => ({
    month,
    newUsers: entry.newUsers,
    payingUsers: entry.payingUsers.size,
  })).sort((a, b) => a.month.localeCompare(b.month));
}

const PLAN_MONTHS: Record<string, number> = {
  mensal: 1,
  semestral: 6,
  anual: 12,
};

function monthsForPlan(plan: string | null | undefined): number {
  return plan ? PLAN_MONTHS[plan] ?? 0 : 0;
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      accessStatus: true,
      role: true,
      createdAt: true,
      trialExpiresAt: true,
      _count: { select: { transactions: true, payments: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        select: { status: true, plan: true, amountBRL: true, createdAt: true },
      },
    },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    accessStatus: user.accessStatus,
    role: user.role,
    createdAt: user.createdAt,
    trialExpiresAt: user.trialExpiresAt,
    transactions: user._count.transactions,
    monthsHired: user.payments
      .filter((payment) => payment.status === "APPROVED")
      .reduce((sum, payment) => sum + monthsForPlan(payment.plan), 0),
    lastPayment: user.payments[0] ?? null,
  }));
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const approved = user.payments.filter((payment) => payment.status === "APPROVED");
  const monthsHired = approved.reduce(
    (sum, payment) => sum + monthsForPlan(payment.plan),
    0,
  );
  const currentPlan = approved[0]?.plan ?? user.payments[0]?.plan ?? null;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accessStatus: user.accessStatus,
      role: user.role,
      createdAt: user.createdAt,
      planExpiresAt: user.planExpiresAt,
      trialExpiresAt: user.trialExpiresAt,
    },
    monthsHired,
    currentPlan,
    payments: user.payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      plan: payment.plan,
      amountBRL: Number(payment.amountBRL),
      createdAt: payment.createdAt,
    })),
  };
}

export async function grantAccessBonus(userId: string, days: number) {
  if (!Number.isInteger(days) || days < 1 || days > 3650) {
    throw new Error("Informe uma quantidade de dias válida (1 a 3650).");
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  const now = Date.now();
  const base = user.planExpiresAt && user.planExpiresAt.getTime() > now
    ? user.planExpiresAt.getTime()
    : now;
  const planExpiresAt = new Date(base + days * 24 * 60 * 60 * 1000);

  return prisma.user.update({
    where: { id: user.id },
    data: { accessStatus: "LIBERADO", planExpiresAt },
    select: { id: true, name: true, email: true, accessStatus: true, planExpiresAt: true },
  });
}

export function paymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    REJECTED: "Recusado",
    CANCELLED: "Cancelado",
    EXPIRED: "Expirado",
  };
  return labels[status] ?? status;
}

export function accessStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    LIBERADO: "Ativos",
    PAGAMENTO_PENDENTE: "Pendentes",
    BLOQUEADO: "Bloqueados",
    CANCELADO: "Cancelados",
  };
  return labels[status] ?? status;
}

export async function promoteAdmin(email: string): Promise<{ email: string; role: string }> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }
  return prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
    select: { email: true, role: true },
  });
}

export async function setUserRole(userId: string, role: "ADMIN" | "USER") {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }
  return prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: { id: true, email: true, role: true },
  });
}