import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/requireAdmin";
import { env } from "../../config/env";
import {
  getOverview,
  listUsers,
  getRevenueByMonth,
  getUsersByMonth,
  getUserDetail,
  setUserRole,
  paymentStatusLabel,
  accessStatusLabel,
} from "./admin.service";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/overview", async (_req: AuthRequest, res) => {
  const data = await getOverview();
  res.json(data);
});

router.get("/revenue", async (_req: AuthRequest, res) => {
  const months = await getRevenueByMonth();
  res.json({ months });
});

router.get("/users-by-month", async (_req: AuthRequest, res) => {
  const months = await getUsersByMonth();
  res.json({ months });
});

router.get("/users", async (_req: AuthRequest, res) => {
  const users = await listUsers();
  res.json({ users });
});

router.get("/users/:userId", async (req: AuthRequest, res) => {
  const data = await getUserDetail(req.params.userId);
  res.json(data);
});

router.patch("/users/:userId/role", async (req: AuthRequest, res) => {
  const role = String(req.body?.role ?? "");
  if (role !== "ADMIN" && role !== "USER") {
    res.status(400).json({ error: "Role inválida." });
    return;
  }
  if (role === "ADMIN") {
    const code = String(req.body?.code ?? "");
    if (!env.adminPromotionCode || code !== env.adminPromotionCode) {
      res.status(403).json({ error: "Senha de administrador incorreta." });
      return;
    }
  }
  const user = await setUserRole(req.params.userId, role);
  res.json({ user });
});

router.get("/payment-status-labels", (_req: AuthRequest, res) => {
  res.json({ labels: paymentStatusLabel });
});

router.get("/access-status-labels", (_req: AuthRequest, res) => {
  res.json({ labels: accessStatusLabel });
});

export default router;