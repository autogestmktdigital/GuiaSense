import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";

const createSchema = z.object({
  name: z.string().min(1, "Informe o nome da categoria.").max(40),
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
  icon: z.string().max(40).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida.").optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(40).optional(),
  icon: z.string().max(40).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function listCategories(userId: string, type?: string) {
  const filter = {
    OR: [{ userId }, { userId: null }],
    ...(type === TransactionType.INCOME || type === TransactionType.EXPENSE
      ? { type: type as TransactionType }
      : {}),
  };

  return prisma.category.findMany({
    where: filter,
    orderBy: [{ isDefault: "asc" }, { name: "asc" }],
  });
}

export async function createCategory(userId: string, input: unknown) {
  const data = createSchema.parse(input);

  const existing = await prisma.category.findFirst({
    where: {
      userId,
      name: data.name.trim(),
      type: data.type,
    },
  });
  if (existing) {
    throw new HttpError(409, "Você já possui uma categoria com esse nome.");
  }

  return prisma.category.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      icon: data.icon ?? "tag",
      color: data.color ?? "#6366F1",
      userId,
    },
  });
}

export async function updateCategory(userId: string, categoryId: string, input: unknown) {
  const data = updateSchema.parse(input);
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new HttpError(404, "Categoria não encontrada.");
  }

  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
}

export async function deleteCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new HttpError(404, "Categoria não encontrada.");
  }
  if (category.isDefault) {
    throw new HttpError(400, "Categorias padrão não podem ser excluídas.");
  }

  const count = await prisma.transaction.count({ where: { categoryId } });
  if (count > 0) {
    throw new HttpError(400, "Não é possível excluir uma categoria com movimentações.");
  }

  await prisma.category.delete({ where: { id: categoryId } });
  return { ok: true };
}
