import { TransactionType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";
import { runAlertEngine } from "../alerts/alertEngine";
import { ensureMonthClosing } from "../monthClosing/monthClosing.service";

const REQUIRED = "Preencha os campos obrigatórios.";

const createSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE], {
    required_error: REQUIRED,
    invalid_type_error: REQUIRED,
  }),
  amount: z
    .number({ required_error: REQUIRED, invalid_type_error: REQUIRED })
    .positive("Informe um valor maior que zero.")
    .finite("Informe um valor maior que zero."),
  description: z.string().max(120).optional(),
  subcategory: z
    .string({ required_error: REQUIRED, invalid_type_error: REQUIRED })
    .min(1, REQUIRED)
    .max(80),
  date: z.string({ required_error: REQUIRED }).datetime("Data inválida."),
  categoryId: z
    .string({ required_error: REQUIRED, invalid_type_error: REQUIRED })
    .min(1, REQUIRED),
  paid: z.boolean().optional(),
  paidAt: z.string().datetime("Data de pagamento inválida.").optional(),
  repetitions: z.number().int().min(2).max(11).optional(),
});

const updateSchema = createSchema.partial();

function monthFilter(month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return undefined;
  }
  const [year, m] = month.split("-").map(Number);
  return {
    gte: new Date(Date.UTC(year, m - 1, 1)),
    lt: new Date(Date.UTC(year, m, 1)),
  };
}

async function assertCategoryAccess(userId: string, categoryId: string, type: TransactionType) {
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      type,
      OR: [{ userId }, { userId: null }],
    },
  });
  if (!category) {
    throw new HttpError(400, "Categoria inválida para esta movimentação.");
  }
  return category;
}

export async function listTransactions(userId: string, query: { month?: string; type?: string }) {
  const type = query.type === TransactionType.INCOME || query.type === TransactionType.EXPENSE
    ? (query.type as TransactionType)
    : undefined;
  const range = monthFilter(query.month);

  return prisma.transaction.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
      ...(range ? { date: range } : {}),
    },
    include: { category: true },
    orderBy: { date: "desc" },
  });
}

function addMonthsClamped(date: Date, delta: number): Date {
  const lastDay = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + delta + 1, 0),
  ).getUTCDate();
  const day = Math.min(date.getUTCDate(), lastDay);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + delta,
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
}

export async function createTransaction(userId: string, input: unknown) {
  const data = createSchema.parse(input);
  await assertCategoryAccess(userId, data.categoryId, data.type);

  const baseDate = new Date(data.date);
  const total = (data.repetitions ?? 0) + 1;
  const seriesId = data.repetitions ? crypto.randomUUID() : null;

  const records = Array.from({ length: total }, (_, index) => ({
    userId,
    type: data.type,
    amount: data.amount,
    description: data.description?.trim() || "",
    subcategory: data.subcategory.trim(),
    date: addMonthsClamped(baseDate, index),
    categoryId: data.categoryId,
    paid: index === 0 ? (data.paid ?? true) : false,
    paidAt:
      index === 0 && (data.paid ?? true)
        ? data.paidAt
          ? new Date(data.paidAt)
          : new Date()
        : null,
    seriesId,
    seriesIndex: data.repetitions ? index : null,
    seriesTotal: data.repetitions ? total : null,
  }));

  const created = await prisma.$transaction(
    records.map((record) => prisma.transaction.create({ data: record, include: { category: true } })),
  );

  await runAlertEngine(prisma, userId);
  await ensureMonthClosing(userId);
  return { transaction: created[0], created: created.length };
}

export async function updateTransaction(userId: string, transactionId: string, input: unknown) {
  const data = updateSchema.parse(input);
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });
  if (!existing) {
    throw new HttpError(404, "Movimentação não encontrada.");
  }

  const type = data.type ?? existing.type;
  if (data.categoryId) {
    await assertCategoryAccess(userId, data.categoryId, type);
  }

  let paidAt: Date | null | undefined;
  if (data.paid === true && !existing.paid) {
    paidAt = data.paidAt ? new Date(data.paidAt) : new Date();
  } else if (data.paid === false) {
    paidAt = null;
  } else if (data.paidAt) {
    paidAt = new Date(data.paidAt);
  }

  const transaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...data,
      paidAt,
      amount: data.amount,
      subcategory: data.subcategory === undefined ? undefined : data.subcategory.trim() || null,
      date: data.date ? new Date(data.date) : undefined,
      type,
    },
    include: { category: true },
  });

  await runAlertEngine(prisma, userId);
  await ensureMonthClosing(userId);
  return transaction;
}

export async function deleteTransaction(userId: string, transactionId: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });
  if (!existing) {
    throw new HttpError(404, "Movimentação não encontrada.");
  }

  await prisma.transaction.delete({ where: { id: transactionId } });
  await runAlertEngine(prisma, userId);
  await ensureMonthClosing(userId);
  return { ok: true };
}
