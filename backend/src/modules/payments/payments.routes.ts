import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import * as paymentsService from "./payments.service";

const router = Router();

router.get("/plans", (_req, res) => {
  res.json({ plans: paymentsService.listPlans() });
});

router.get("/status", requireAuth, async (req: AuthRequest, res) => {
  const status = await paymentsService.getStatus(req.user!.id);
  res.json(status);
});

router.post("/checkout", requireAuth, async (req: AuthRequest, res) => {
  const plan = (req.body as { plan?: string }).plan;
  const checkout = await paymentsService.createCheckout(req.user!.id, plan);
  res.json(checkout);
});

router.post("/webhook", async (req, res) => {
  const result = await paymentsService.handleWebhook(req.body);
  res.json(result);
});

router.post("/simulate/:paymentId", requireAuth, async (req: AuthRequest, res) => {
  const result = await paymentsService.simulateApproval(req.params.paymentId);
  res.json(result);
});

export default router;
