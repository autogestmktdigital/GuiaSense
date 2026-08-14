import { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { AuthRequest } from "./auth";

export async function requireAccess(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new HttpError(401, "Autenticação necessária.");
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new HttpError(401, "Usuário não encontrado.");
  }

  if (user.accessStatus !== "LIBERADO") {
    const message =
      user.accessStatus === "BLOQUEADO"
        ? "Acesso bloqueado. Entre em contato para regularizar seu acesso."
        : user.accessStatus === "CANCELADO"
          ? "Sua assinatura foi cancelada. Renove para continuar usando o GuiaSense."
          : "Pagamento pendente. Libere seu acesso para continuar.";
    throw new HttpError(403, message);
  }

  next();
}
