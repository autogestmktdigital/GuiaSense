import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { prisma } from "../../lib/prisma";

const router = Router();

const updateSchema = z.object({
  name: z.string().min(2, "Informe seu nome.").max(80).optional(),
});

router.use(requireAuth);

router.patch("/me", async (req: AuthRequest, res) => {
  const data = updateSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { name: data.name },
  });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accessStatus: user.accessStatus,
      role: user.role,
    },
  });
});

router.post("/cancel-subscription", async (req: AuthRequest, res) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { accessStatus: "CANCELADO" },
  });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accessStatus: user.accessStatus,
      role: user.role,
    },
  });
});

export default router;
