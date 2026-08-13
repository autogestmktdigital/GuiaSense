import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError";

type ErrorShape = { message: string; details?: unknown };

export function errorHandler(
  error: unknown,
  _req: unknown,
  res: { status: (code: number) => { json: (body: ErrorShape) => void } },
  _next: unknown,
): void {
  if (error instanceof ZodError) {
    const first = error.errors[0]?.message ?? "Dados inválidos.";
    res.status(400).json({ message: first, details: error.flatten() });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ message: error.message, details: error.details });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ message: "Já existe um registro com esses dados." });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ message: "Registro não encontrado." });
      return;
    }
  }

  console.error("[error]", error);
  res.status(500).json({ message: "Erro interno do servidor." });
}
