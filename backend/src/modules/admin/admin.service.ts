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
    revenueLast30d,
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
      where: { status: "APPROVED", createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
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
      revenueLast30d: Number(revenueLast30d._sum.amountBRL || 0),
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
      _count: { select: { transactions: true, payments: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, amountBRL: true, createdAt: true },
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
    transactions: user._count.transactions,
    lastPayment: user.payments[0] ?? null,
  }));
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