import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/requireAdmin";
import { getOverview, listUsers, paymentStatusLabel, accessStatusLabel } from "./admin.service";

const router = Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get("/overview", async (_req: AuthRequest, res) => {
  const data = await getOverview();
  res.json(data);
});

router.get("/users", async (_req: AuthRequest, res) => {
  const users = await listUsers();
  res.json({ users });
});

router.get("/payment-status-labels", (_req: AuthRequest, res) => {
  res.json({ labels: paymentStatusLabel });
});

router.get("/access-status-labels", (_req: AuthRequest, res) => {
  res.json({ labels: accessStatusLabel });
});

export default router;