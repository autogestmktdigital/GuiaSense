import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/httpError";
import { encryptField, decryptField } from "../../lib/crypto";
import { seedDefaultCategories } from "../../utils/seedCategories";
import { TRIAL_DAYS } from "../payments/plans";

export const PRIVACY_POLICY_VERSION = "2026-08-27";

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(80),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Para criar a conta, você precisa aceitar a Política de Privacidade." }),
  }),
});

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe sua senha."),
});

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

function publicUser(user: {
  id: string;
  name: string;
  email: string;
  accessStatus: string;
  role: string;
  hasSeenWelcome: boolean;
  trialExpiresAt: Date | null;
  cpfCnpj: string | null;
  billingZip: string | null;
  billingStreet: string | null;
  billingNumber: string | null;
  billingComplement: string | null;
  billingDistrict: string | null;
  billingCity: string | null;
  billingState: string | null;
  consentAt: Date | null;
  consentVersion: string | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessStatus: user.accessStatus,
    role: user.role,
    hasSeenWelcome: user.hasSeenWelcome,
    trialExpiresAt: user.trialExpiresAt,
    cpfCnpj: decryptField(user.cpfCnpj),
    billingZip: user.billingZip,
    billingStreet: user.billingStreet,
    billingNumber: user.billingNumber,
    billingComplement: user.billingComplement,
    billingDistrict: user.billingDistrict,
    billingCity: user.billingCity,
    billingState: user.billingState,
    consentAt: user.consentAt,
    consentVersion: user.consentVersion,
    createdAt: user.createdAt,
  };
}

export async function register(input: unknown) {
  const data = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (existing) {
    throw new HttpError(409, "Já existe uma conta com este e-mail.");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      accessStatus: "LIBERADO",
      trialExpiresAt: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      consentAt: new Date(),
      consentVersion: PRIVACY_POLICY_VERSION,
    },
  });

  await seedDefaultCategories(prisma, user.id);

  return { token: signToken(user.id), user: publicUser(user) };
}

export async function login(input: unknown) {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
  if (!user) {
    throw new HttpError(401, "E-mail ou senha incorretos.");
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "E-mail ou senha incorretos.");
  }

  return { token: signToken(user.id), user: publicUser(user) };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Usuário não encontrado.");
  }
  return publicUser(user);
}
