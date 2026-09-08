import { PrismaClient, TransactionType } from "@prisma/client";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { seedDefaultCategories } from "../utils/seedCategories";
import { encryptField } from "../lib/crypto";
import { PRIVACY_POLICY_VERSION } from "../modules/auth/auth.service";
import { upsertMonthClosing } from "../modules/monthClosing/monthClosing.service";
import { runAlertEngine } from "../modules/alerts/alertEngine";

const DEMO_EMAIL = "demo@guiasense.com";
const DEMO_PASSWORD = "Demo1234!";
const DEMO_NAME = "Usuário Demo";
const DEMO_CPF = "123.456.789-00";

function utcDate(year: number, monthIndex0: number, day: number): Date {
  return new Date(Date.UTC(year, monthIndex0, day));
}

function lastDayOfMonth(year: number, month1: number): number {
  return new Date(Date.UTC(year, month1, 0)).getUTCDate();
}

function addMonthsUtc(month1: number, year: number, delta: number): { year: number; month1: number } {
  const date = new Date(Date.UTC(year, month1 - 1, 1));
  date.setUTCMonth(date.getUTCMonth() + delta);
  return { year: date.getUTCFullYear(), month1: date.getUTCMonth() + 1 };
}

function daysFromToday(days: number, now: Date): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
}

type TxInput = {
  type: TransactionType;
  amount: number;
  description: string;
  subcategory: string;
  date: Date;
  categoryId: string;
  paid: boolean;
  paidAt: Date | null;
  seriesId: string | null;
  seriesIndex: number | null;
  seriesTotal: number | null;
};

function assertLocalDatabase(): void {
  const url = process.env.DATABASE_URL || "";
  if (!/localhost|127\.0\.0\.1/.test(url)) {
    throw new Error("Seed DEMO bloqueado: este script só pode ser executado em banco local.");
  }
}

async function main(): Promise<void> {
  assertLocalDatabase();

  const now = new Date();
  const currentMonth1 = now.getUTCMonth() + 1;
  const currentYear = now.getUTCFullYear();

  const months = [-3, -2, -1, 0].map((delta) => {
    const { year, month1 } = addMonthsUtc(currentMonth1, currentYear, delta);
    return { delta, year, month1, index: delta + 3 };
  });

  // 1) Usuário DEMO (idempotente)
  let userId: string;
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  if (existing) {
    userId = existing.id;
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: DEMO_NAME,
        accessStatus: "LIBERADO",
        role: "USER",
        hasSeenWelcome: false,
        trialExpiresAt: daysFromToday(8, now),
        consentAt: now,
        consentVersion: PRIVACY_POLICY_VERSION,
        cpfCnpj: encryptField(DEMO_CPF),
      },
    });
  } else {
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        passwordHash,
        accessStatus: "LIBERADO",
        role: "USER",
        hasSeenWelcome: false,
        trialExpiresAt: daysFromToday(8, now),
        consentAt: now,
        consentVersion: PRIVACY_POLICY_VERSION,
        cpfCnpj: encryptField(DEMO_CPF),
      },
    });
    userId = user.id;
  }

  // 2) Categorias padrão (idempotente)
  await seedDefaultCategories(prisma, userId);

  const findCategory = async (name: string, type: TransactionType) => {
    const category = await prisma.category.findFirst({
      where: { userId, name, type },
    });
    if (!category) throw new Error(`Categoria padrão ausente: ${name} (${type})`);
    return category;
  };

  const [catSalario, catRendaExtra, catMoradia, catTransporte, catSaude, catLazer, catAlimentacao] =
    await Promise.all([
      findCategory("Salário", TransactionType.INCOME),
      findCategory("Renda Extra", TransactionType.INCOME),
      findCategory("Moradia", TransactionType.EXPENSE),
      findCategory("Transporte", TransactionType.EXPENSE),
      findCategory("Saúde", TransactionType.EXPENSE),
      findCategory("Lazer e Assinaturas", TransactionType.EXPENSE),
      findCategory("Alimentação", TransactionType.EXPENSE),
    ]);

  const categoryBySubcategory: Record<string, string> = {
    Aluguel: catMoradia.id,
    Condomínio: catMoradia.id,
    Energia: catMoradia.id,
    "Internet/TV": catMoradia.id,
    "Plano de saúde": catSaude.id,
    Academia: catSaude.id,
    Combustível: catTransporte.id,
    "Assinaturas digitais": catLazer.id,
    Passeios: catLazer.id,
    Supermercado: catAlimentacao.id,
    Lanches: catAlimentacao.id,
  };

  // 3) Limpar dados anteriores do usuário DEMO (nunca afeta outros usuários)
  await prisma.alert.deleteMany({ where: { userId } });
  await prisma.transaction.deleteMany({ where: { userId } });
  await prisma.monthClosing.deleteMany({ where: { userId } });
  await prisma.monthProjection.deleteMany({ where: { userId } });
  await prisma.monthProjectionD2.deleteMany({ where: { userId } });
  await prisma.budget.deleteMany({ where: { userId } });

  // 4) Transações — 3 meses anteriores completos + mês atual
  const tx: TxInput[] = [];
  const salarySeries = randomUUID();
  const extraIncomeSeries = randomUUID();

  const aluguelSeries = randomUUID();
  const condominioSeries = randomUUID();
  const energiaSeries = randomUUID();
  const internetSeries = randomUUID();
  const planoSaudeSeries = randomUUID();
  const academiaSeries = randomUUID();
  const combustivelSeries = randomUUID();
  const assinaturaSeries = randomUUID();
  const passeiosSeries = randomUUID();

  for (const m of months) {
    const isCurrent = m.delta === 0;
    const lastDay = lastDayOfMonth(m.year, m.month1);

    const push = (data: TxInput) => tx.push(data);

    // Receitas
    push({
      type: TransactionType.INCOME,
      amount: 5500,
      description: "Salário mensal",
      subcategory: "Salário",
      date: utcDate(m.year, m.month1 - 1, 5),
      categoryId: catSalario.id,
      paid: true,
      paidAt: utcDate(m.year, m.month1 - 1, 5),
      seriesId: salarySeries,
      seriesIndex: m.index,
      seriesTotal: 4,
    });
    push({
      type: TransactionType.INCOME,
      amount: 650,
      description: "Renda extra - Freelance",
      subcategory: "Freelance",
      date: utcDate(m.year, m.month1 - 1, 10),
      categoryId: catRendaExtra.id,
      paid: true,
      paidAt: utcDate(m.year, m.month1 - 1, 10),
      seriesId: extraIncomeSeries,
      seriesIndex: m.index,
      seriesTotal: 4,
    });

    // Despesas fixas
    const extras = {
      aluguel: 1650,
      condominio: 180,
      internet: 120,
      planoSaude: 150,
      academia: 130,
      energia: m.delta === -3 ? 175 : m.delta === -2 ? 185 : m.delta === -1 ? 195 : 210,
      combustivel: m.delta === -3 ? 310 : m.delta === -2 ? 330 : m.delta === -1 ? 350 : 380,
      assinatura: m.delta === -3 ? 80 : m.delta === -2 ? 85 : m.delta === -1 ? 85 : 80,
      passeios: m.delta === -3 ? 240 : m.delta === -2 ? 190 : m.delta === -1 ? 220 : 200,
    };

    const lanches1 = m.delta === -3 ? 60 : m.delta === -2 ? 65 : m.delta === -1 ? 70 : 65;
    const lanches2 = m.delta === -3 ? 50 : m.delta === -2 ? 55 : m.delta === -1 ? 60 : 65;
    const mercadoAmounts =
      m.delta === -3
        ? [125, 130, 130, 135]
        : m.delta === -2
          ? [135, 140, 135, 140]
          : m.delta === -1
            ? [140, 145, 145, 140]
            : [180, 210, 200, 200];
    const mercadoDays = [8, 15, 22, 29].map((d) => Math.min(d, lastDay));

    const fixedItems: {
      description: string;
      subcategory: string;
      amount: number;
      seriesId: string | null;
      date: Date;
      paid: boolean;
    }[] = [
      {
        description: "Aluguel apartamento",
        subcategory: "Aluguel",
        amount: extras.aluguel,
        seriesId: aluguelSeries,
        date: utcDate(m.year, m.month1 - 1, 5),
        paid: true,
      },
      {
        description: "Condomínio",
        subcategory: "Condomínio",
        amount: extras.condominio,
        seriesId: condominioSeries,
        date: utcDate(m.year, m.month1 - 1, 10),
        paid: true,
      },
      {
        description: "Conta de energia",
        subcategory: "Energia",
        amount: extras.energia,
        seriesId: energiaSeries,
        date: isCurrent ? daysFromToday(3, now) : utcDate(m.year, m.month1 - 1, 20),
        paid: !isCurrent,
      },
      {
        description: "Internet",
        subcategory: "Internet/TV",
        amount: extras.internet,
        seriesId: internetSeries,
        date: isCurrent ? daysFromToday(2, now) : utcDate(m.year, m.month1 - 1, 12),
        paid: !isCurrent,
      },
      {
        description: "Plano de saúde",
        subcategory: "Plano de saúde",
        amount: extras.planoSaude,
        seriesId: planoSaudeSeries,
        date: utcDate(m.year, m.month1 - 1, 1),
        paid: true,
      },
      {
        description: "Academia",
        subcategory: "Academia",
        amount: extras.academia,
        seriesId: academiaSeries,
        date: isCurrent ? daysFromToday(5, now) : utcDate(m.year, m.month1 - 1, 10),
        paid: !isCurrent,
      },
      {
        description: "Assinatura streaming",
        subcategory: "Assinaturas digitais",
        amount: extras.assinatura,
        seriesId: assinaturaSeries,
        date: isCurrent ? daysFromToday(4, now) : utcDate(m.year, m.month1 - 1, 15),
        paid: !isCurrent,
      },
      {
        description: "Combustível",
        subcategory: "Combustível",
        amount: extras.combustivel,
        seriesId: combustivelSeries,
        date: utcDate(m.year, m.month1 - 1, 15),
        paid: true,
      },
      {
        description: "Passeios e lazer",
        subcategory: "Passeios",
        amount: extras.passeios,
        seriesId: passeiosSeries,
        date: utcDate(m.year, m.month1 - 1, 20),
        paid: true,
      },
    ];

    for (const item of fixedItems) {
      push({
        type: TransactionType.EXPENSE,
        amount: item.amount,
        description: item.description,
        subcategory: item.subcategory,
        date: item.date,
        categoryId: categoryBySubcategory[item.subcategory],
        paid: item.paid,
        paidAt: item.paid ? item.date : null,
        seriesId: item.seriesId,
        seriesIndex: m.index,
        seriesTotal: 4,
      });
    }

    // Supermercado (Alimentação) — várias compras
    for (let i = 0; i < mercadoAmounts.length; i++) {
      const date = utcDate(m.year, m.month1 - 1, mercadoDays[i]);
      push({
        type: TransactionType.EXPENSE,
        amount: mercadoAmounts[i],
        description: "Compra no mercado",
        subcategory: "Supermercado",
        date,
        categoryId: categoryBySubcategory.Supermercado,
        paid: true,
        paidAt: date,
        seriesId: null,
        seriesIndex: null,
        seriesTotal: null,
      });
    }

    // Lanches/cafés (Alimentação)
    for (const [amount, day] of [
      [lanches1, 10],
      [lanches2, 22],
    ] as const) {
      const date = utcDate(m.year, m.month1 - 1, day);
      push({
        type: TransactionType.EXPENSE,
        amount,
        description: "Lanches e cafés",
        subcategory: "Lanches",
        date,
        categoryId: categoryBySubcategory.Lanches,
        paid: true,
        paidAt: date,
        seriesId: null,
        seriesIndex: null,
        seriesTotal: null,
      });
    }
  }

  await prisma.$transaction(tx.map((t) => prisma.transaction.create({ data: { ...t, userId } })));

  // 5) Fechamentos dos 3 meses anteriores (engine REAL, com IA/fallback)
  for (const m of months.filter((m) => m.delta !== 0)) {
    await upsertMonthClosing(userId, m.year, m.month1);
  }

  // 6) Engine REAL de alertas (aumento de categoria, variação de subcategoria, atrasados)
  await runAlertEngine(prisma, userId);

  const transactionCount = await prisma.transaction.count({ where: { userId } });

  console.log("========================================");
  console.log("Seed DEMO concluído com sucesso!");
  console.log(`Usuário: ${DEMO_EMAIL}`);
  console.log(`Senha: ${DEMO_PASSWORD}`);
  console.log(`Transações criadas: ${transactionCount}`);
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });