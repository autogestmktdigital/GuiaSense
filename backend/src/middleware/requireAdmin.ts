import { NextFunction, Response } from "express";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/httpError";
import { AuthRequest } from "./auth";

export async function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw new HttpError(401, "Autenticação necessária.");
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    throw new HttpError(401, "Usuário não encontrado.");
  }

  if (user.role !== "ADMIN") {
    throw new HttpError(403, "Acesso restrito aos administradores.");
  }

  next();
}