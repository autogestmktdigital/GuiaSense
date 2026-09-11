import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL || required("DATABASE_URL"),
  jwtSecret: process.env.JWT_SECRET || required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || "",
  deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  deepseekModel: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  apiUrl: process.env.API_URL || "http://localhost:4000",
  mercadopagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  mercadopagoWebhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || "",
  adminPromotionCode: process.env.ADMIN_PROMOTION_CODE || "",
  dataEncryptionKey: process.env.DATA_ENCRYPTION_KEY || required("DATA_ENCRYPTION_KEY"),
  focusNfeEnv: process.env.FOCUS_NFE_ENV || "homologacao",
  focusNfeToken: process.env.FOCUS_NFE_ENV === "producao"
    ? process.env.FOCUS_NFE_TOKEN_PRODUCAO || ""
    : process.env.FOCUS_NFE_TOKEN_HOMOLOGACAO || "",
  focusNfeWebhookSecret: process.env.FOCUS_NFE_WEBHOOK_SECRET || "",
  focusNfeEmitterCnpj: process.env.FOCUS_NFE_EMITTER_CNPJ || "",
  focusNfeEmitterIm: process.env.FOCUS_NFE_EMITTER_IM || "",
  focusNfeEmitterIbge: process.env.FOCUS_NFE_EMITTER_IBGE || "",
  focusNfeEmitterSimples: process.env.FOCUS_NFE_EMITTER_SIMPLES === "true",
  focusNfeEmitterRegime: process.env.FOCUS_NFE_EMITTER_REGIME || "6",
  focusNfeServiceItem: process.env.FOCUS_NFE_SERVICE_ITEM || "",
  focusNfeServiceTaxCode: process.env.FOCUS_NFE_SERVICE_TAX_CODE || "",
  focusNfeServiceRate: Number(process.env.FOCUS_NFE_SERVICE_RATE || "0"),
  focusNfeServiceDiscrimination:
    process.env.FOCUS_NFE_SERVICE_DISCRIMINATION || "",
};
