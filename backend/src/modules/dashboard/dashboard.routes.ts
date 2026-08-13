import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import * as dashboardService from "./dashboard.service";

const router = Router();

router.use(requireAuth);

router.get("/overview", async (req: AuthRequest, res) => {
  const overview = await dashboardService.getOverview(req.user!.id);
  res.json({ overview });
});

router.get("/top-expenses", async (req: AuthRequest, res) => {
  const month = String(req.query.month ?? "");
  const period = String(req.query.period ?? "month");
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "month inválido. Use o formato YYYY-MM." });
  }
  if (!["month", "quarter", "semester"].includes(period)) {
    return res.status(400).json({ error: "period inválido. Use month, quarter ou semester." });
  }
  const data = await dashboardService.getTopExpenses(
    req.user!.id,
    month,
    period as dashboardService.TopExpensesPeriod,
  );
  res.json(data);
});

router.get("/category-expenses", async (req: AuthRequest, res) => {
  const month = String(req.query.month ?? "");
  const period = String(req.query.period ?? "month");
  const categoryId = String(req.query.categoryId ?? "");
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: "month inválido. Use o formato YYYY-MM." });
  }
  if (!["month", "quarter", "semester"].includes(period)) {
    return res.status(400).json({ error: "period inválido. Use month, quarter ou semester." });
  }
  if (!categoryId) {
    return res.status(400).json({ error: "categoryId é obrigatório." });
  }
  const data = await dashboardService.getCategoryExpenses(
    req.user!.id,
    month,
    period as dashboardService.TopExpensesPeriod,
    categoryId,
  );
  res.json(data);
});

router.get("/upcoming-payments", async (req: AuthRequest, res) => {
  const data = await dashboardService.getUpcomingPayments(req.user!.id);
  res.json(data);
});

export default router;
