import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { requireAccess } from "../../middleware/requireAccess";
import * as alertsService from "./alerts.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  const alerts = await alertsService.listAlerts(req.user!.id, status);
  res.json({ alerts });
});

router.patch("/:id/read", requireAccess, async (req: AuthRequest, res) => {
  const alert = await alertsService.markRead(req.user!.id, req.params.id);
  res.json({ alert });
});

router.patch("/:id/dismiss", requireAccess, async (req: AuthRequest, res) => {
  const alert = await alertsService.dismiss(req.user!.id, req.params.id);
  res.json({ alert });
});

export default router;
