import { prisma } from "../lib/prisma";
import { promoteAdmin } from "../modules/admin/admin.service";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx src/scripts/makeAdmin.ts <email>");
    process.exit(1);
  }
  const result = await promoteAdmin(email);
  console.log(`Usuário ${result.email} promovido para ${result.role}.`);
}

main()
  .catch((error) => {
    console.error(error.message ?? error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());