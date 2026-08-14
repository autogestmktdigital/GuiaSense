import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import * as insightsService from "./insights.service";
import {
  ensureMonthClosing,
  getVigentMonthClosing,
} from "../monthClosing/monthClosing.service";
import { getVigentProjectionInsight } from "../d5/d5.service";
import { getVigentD2Insight } from "../d2/d2.service";
import { prisma } from "../../lib/prisma";
import { getVigentOverdueInsight, getVigentVariationInsights, getVigentCategoryVariationInsights, getVigentRecebimentoInsight, syncOverdueAlerts } from "../alerts/alertEngine";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  await Promise.all([ensureMonthClosing(userId), syncOverdueAlerts(prisma, userId)]);
  const [insights, closing, d2, projection, overdue, recebimento, variations, categoryVariations] = await Promise.all([
    insightsService.getInsights(userId),
    getVigentMonthClosing(userId),
    getVigentD2Insight(userId),
    getVigentProjectionInsight(userId),
    getVigentOverdueInsight(prisma, userId),
    getVigentRecebimentoInsight(prisma, userId),
    getVigentVariationInsights(prisma, userId),
    getVigentCategoryVariationInsights(prisma, userId),
  ]);
  const all = [];
  if (overdue) all.push(overdue);
  if (recebimento) all.push(recebimento);
  if (closing) all.push(closing);
  if (d2) all.push(d2);
  else if (projection) all.push(projection);
  all.push(...variations);
  all.push(...categoryVariations);
  all.push(...insights);
  if (all.length === 0) {
    all.push({
      title: "Tudo certo por enquanto! 😊",
      message: "Quando houver algo importante nas suas finanças, o GuiaSense vai avisar você por aqui.",
      tone: "neutral",
    });
  }
  res.json({ insights: all });
});

export default router;
