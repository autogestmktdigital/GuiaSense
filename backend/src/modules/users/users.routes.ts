import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(80).optional(),
});

const billingSchema = z.object({
  billingZip: z.string().min(8, "Informe o CEP.").max(10),
  billingStreet: z.string().min(2, "Informe o logradouro.").max(120),
  billingNumber: z.string().min(1, "Informe o número.").max(10),
  billingComplement: z.string().max(80).optional(),
  billingDistrict: z.string().min(2, "Informe o bairro.").max(80),
  billingCity: z.string().min(2, "Informe a cidade.").max(80),
  billingState: z.string().length(2, "Informe a UF.").regex(/^[A-Z]{2}$/, "UF inválida."),
});

function publicUserFields(user: {
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
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    accessStatus: user.accessStatus,
    role: user.role,
    hasSeenWelcome: user.hasSeenWelcome,
    trialExpiresAt: user.trialExpiresAt,
    cpfCnpj: user.cpfCnpj,
    billingZip: user.billingZip,
    billingStreet: user.billingStreet,
    billingNumber: user.billingNumber,
    billingComplement: user.billingComplement,
    billingDistrict: user.billingDistrict,
    billingCity: user.billingCity,
    billingState: user.billingState,
  };
}

router.use(requireAuth);

router.patch("/me", async (req: AuthRequest, res) => {
  const data = updateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: data.name },
  });
  res.json({ user: publicUserFields(user) });
});

router.patch("/billing", async (req: AuthRequest, res) => {
  const data = billingSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      billingZip: data.billingZip,
      billingStreet: data.billingStreet,
      billingNumber: data.billingNumber,
      billingComplement: data.billingComplement,
      billingDistrict: data.billingDistrict,
      billingCity: data.billingCity,
      billingState: data.billingState,
    },
  });
  res.json({ user: publicUserFields(user) });
});

router.post("/cancel-subscription", async (req: AuthRequest, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { accessStatus: "CANCELADO" },
  });
  res.json({ user: publicUserFields(user) });
});

router.patch("/welcome", async (req: AuthRequest, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { hasSeenWelcome: true },
  });
  res.json({
    user: {
      id: user.id,
      hasSeenWelcome: user.hasSeenWelcome,
    },
  });
});

export default router;
