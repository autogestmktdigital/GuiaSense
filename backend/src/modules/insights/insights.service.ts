import OpenAI from "openai";
import { TransactionType } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";

const cache = new Map<string, { at: number; insights: Insight[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

export type Insight = {
  title: string;
  message: string;
  tone: "positive" | "neutral" | "attention";
};

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
}

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function buildSummary(userId: string) {
  const month = currentYearMonth();
  const { start, end } = monthRange(month);

  const [income, expense, topByCategory, activeAlerts] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.INCOME, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, type: TransactionType.EXPENSE, date: { gte: start, lt: end } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 4,
    }),
    prisma.alert.findMany({ where: { userId, status: { in: ["ACTIVE", "READ"] } }, take: 5 }),
  ]);

  const totalIncome = Number(income._sum.amount || 0);
  const totalExpense = Number(expense._sum.amount || 0);

  const topCategories = [];
  for (const row of topByCategory) {
    const category = await prisma.category.findUnique({ where: { id: row.categoryId } });
    topCategories.push(`${category?.name ?? "Outros"}: ${Number(row._sum.amount || 0).toFixed(2)}`);
  }

  const budgetText: string[] = [];

  return {
    month,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    topCategories,
    budgets: budgetText,
    alerts: activeAlerts.map((a) => a.message),
  };
}

function deterministicInsights(summary: Awaited<ReturnType<typeof buildSummary>>): Insight[] {
  const insights: Insight[] = [];
  const { totalIncome, totalExpense, balance } = summary;

  if (balance < 0) {
    insights.push({
      title: "Atenção ao saldo",
      message: `Seu saldo está negativo em ${Math.abs(balance).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}. Reavalie os gastos deste mês.`,
      tone: "attention",
    });
  }

  if (totalIncome > 0) {
    const savingsRate = Math.round(((totalIncome - totalExpense) / totalIncome) * 100);
    if (savingsRate >= 20) {
      insights.push({
        title: "Boa economia",
        message: `Você está poupando cerca de ${savingsRate}% das suas receitas este mês.`,
        tone: "positive",
      });
    } else if (savingsRate < 0) {
      insights.push({
        title: "Gastando mais do que ganha",
        message: "Suas despesas ultrapassaram suas receitas. Considere revisar os gastos mais altos.",
        tone: "attention",
      });
    }
  }

  return insights.slice(0, 3);
}

export async function getInsights(userId: string): Promise<Insight[]> {
  const month = currentYearMonth();
  const cacheKey = `${userId}:${month}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.insights;
  }

  const summary = await buildSummary(userId);
  let insights: Insight[];

  if (!env.openaiApiKey) {
    insights = deterministicInsights(summary);
  } else {
    try {
      const client = new OpenAI({ apiKey: env.openaiApiKey });
      const prompt = `
Você é o GuiaSense, um guia financeiro simples e amigável que conversa em português do Brasil.
Com base nos dados financeiros abaixo do mês ${summary.month}, escreva no máximo 3 observações curtas e práticas.

Dados:
- Receitas: ${summary.totalIncome}
- Despesas: ${summary.totalExpense}
- Saldo: ${summary.balance}
- Maiores categorias de gasto: ${summary.topCategories.join(", ") || "nenhuma"}
- Alertas: ${summary.alerts.join(" | ") || "nenhum"}

Regras:
- Linguagem simples, objetiva e educativa, sem jargão técnico.
- Cada observação deve ter no máximo 2 frases.
- Use o formato JSON: [{"title":"título curto","message":"texto","tone":"positive|neutral|attention"}]
- Responda somente o JSON válido.
`;
      const completion = await client.chat.completions.create({
        model: env.openaiModel,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()) as Insight[];
      insights = Array.isArray(parsed) ? parsed.slice(0, 3) : deterministicInsights(summary);
    } catch (error) {
      console.error("[insights] OpenAI falhou, usando fallback", error);
      insights = deterministicInsights(summary);
    }
  }

  cache.set(cacheKey, { at: Date.now(), insights });
  return insights;
}
