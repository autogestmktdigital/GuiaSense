import { PrismaClient, TransactionType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  DEFAULT_EXPENSE_CATEGORIES,
  LEGACY_EXPENSE_CATEGORY_MAP,
  seedDefaultCategories,
} from "../utils/seedCategories";

async function migrateLegacyCategories(prisma: PrismaClient, userId: string): Promise<void> {
  const legacyNames = Object.keys(LEGACY_EXPENSE_CATEGORY_MAP);

  const legacyCategories = await prisma.category.findMany({
    where: { userId, type: TransactionType.EXPENSE, name: { in: legacyNames } },
  });

  for (const legacy of legacyCategories) {
    const targetName = LEGACY_EXPENSE_CATEGORY_MAP[legacy.name];

    let target = await prisma.category.findUnique({
      where: { userId_name_type: { userId, name: targetName, type: TransactionType.EXPENSE } },
    });

    if (!target) {
      const defaults = DEFAULT_EXPENSE_CATEGORIES.find((c) => c.name === targetName);
      target = await prisma.category.create({
        data: {
          userId,
          type: TransactionType.EXPENSE,
          name: targetName,
          icon: defaults?.icon ?? "tag",
          color: defaults?.color ?? "#94A3B8",
          isDefault: true,
        },
      });
    }

    await prisma.transaction.updateMany({
      where: { userId, categoryId: legacy.id },
      data: { categoryId: target.id },
    });

    await prisma.category.delete({ where: { id: legacy.id } });
  }
}

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await seedDefaultCategories(prisma, user.id);
    await migrateLegacyCategories(prisma, user.id);
    console.log("Categorias sincronizadas para", user.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
