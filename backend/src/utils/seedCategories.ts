import { PrismaClient, TransactionType } from "@prisma/client";

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Alimentação", icon: "utensils", color: "#F59E0B" },
  { name: "Moradia", icon: "home", color: "#0EA5E9" },
  { name: "Transporte", icon: "car", color: "#10B981" },
  { name: "Saúde", icon: "heart-pulse", color: "#EF4444" },
  { name: "Educação", icon: "book", color: "#8B5CF6" },
  { name: "Lazer e Assinaturas", icon: "gamepad", color: "#EC4899" },
  { name: "Compras e Cuidados", icon: "shopping-bag", color: "#F97316" },
  { name: "Financeiro e Impostos", icon: "credit-card", color: "#6366F1" },
  { name: "Outras Despesas", icon: "tag", color: "#94A3B8" },
];

export const LEGACY_EXPENSE_CATEGORY_MAP: Record<string, string> = {
  Lazer: "Lazer e Assinaturas",
  Assinaturas: "Lazer e Assinaturas",
  Compras: "Compras e Cuidados",
  "Cuidados Pessoais": "Compras e Cuidados",
  Financeiro: "Financeiro e Impostos",
  "Impostos e Taxas": "Financeiro e Impostos",
  "Família": "Outras Despesas",
};

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salário", icon: "banknote", color: "#22C55E" },
  { name: "Renda Extra", icon: "briefcase", color: "#3B82F6" },
  { name: "Investimentos", icon: "trending-up", color: "#A3E635" },
  { name: "Benefícios", icon: "gift", color: "#FBBF24" },
  { name: "Recebimentos", icon: "wallet", color: "#14B8A6" },
  { name: "Outras Receitas", icon: "tag", color: "#94A3B8" },
];

export async function seedDefaultCategories(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const data = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, type: TransactionType.EXPENSE })),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, type: TransactionType.INCOME })),
  ];

  for (const category of data) {
    await prisma.category.upsert({
      where: {
        userId_name_type: { userId, name: category.name, type: category.type },
      },
      create: { ...category, isDefault: true, userId },
      update: {},
    });
  }
}
