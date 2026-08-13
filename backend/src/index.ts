import { app } from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

async function main() {
  try {
    await prisma.$connect();
    console.log("Banco de dados conectado.");
  } catch (error) {
    console.error("Falha ao conectar ao banco de dados:", error);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`GuiaSense API rodando em http://localhost:${env.port}`);
  });
}

main();
