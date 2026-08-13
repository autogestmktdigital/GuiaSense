import { prisma } from "../lib/prisma";
import { seedDefaultCategories } from "../utils/seedCategories";

async function main() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    await seedDefaultCategories(prisma, user.id);
    console.log("Categorias sincronizadas para", user.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
