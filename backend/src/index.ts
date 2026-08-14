import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { expireOverduePlans } from "./modules/payments/payments.service";

const PLAN_CHECK_INTERVAL_MS = 60 * 60 * 1000;

async function checkPlans(): Promise<void> {
  try {
    const expired = await expireOverduePlans();
    if (expired > 0) {
      console.log(`Planos vencidos: ${expired} usuário(s) marcado(s) como pendentes.`);
    }
  } catch (error) {
    console.error("Falha ao verificar planos vencidos:", error);
  }
}

async function main() {
  try {
    await prisma.$connect();
    console.log("Banco de dados conectado.");
  } catch (error) {
    console.error("Falha ao conectar ao banco de dados:", error);
    process.exit(1);
  }

  void checkPlans();
  setInterval(checkPlans, PLAN_CHECK_INTERVAL_MS);

  app.listen(env.port, () => {
    console.log(`GuiaSense API rodando em http://localhost:${env.port}`);
  });
}

main();