import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";

export async function listAlerts(userId: string, status?: string) {
  const allowed = ["ACTIVE", "READ", "DISMISSED"];
  return prisma.alert.findMany({
    where: {
      userId,
      ...(status && allowed.includes(status) ? { status: status as never } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
}

export async function markRead(userId: string, alertId: string) {
  const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } });
  if (!alert) {
    throw new HttpError(404, "Alerta não encontrado.");
  }

  return prisma.alert.update({
    where: { id: alertId },
    data: { status: "READ", readAt: new Date() },
  });
}

export async function dismiss(userId: string, alertId: string) {
  const alert = await prisma.alert.findFirst({ where: { id: alertId, userId } });
  if (!alert) {
    throw new HttpError(404, "Alerta não encontrado.");
  }

  return prisma.alert.update({ where: { id: alertId }, data: { status: "DISMISSED" } });
}
