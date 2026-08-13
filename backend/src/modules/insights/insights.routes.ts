import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import * as insightsService from "./insights.service";
import {
  ensureMonthClosing,
  getVigentMonthClosing,
} from "../monthClosing/monthClosing.service";
import { getVigentProjectionInsight } from "../d5/d5.service";
import { getVigentD2Insight } from "../d2/d2.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  await ensureMonthClosing(userId);
  const [insights, closing, d2, projection] = await Promise.all([
    insightsService.getInsights(userId),
    getVigentMonthClosing(userId),
    getVigentD2Insight(userId),
    getVigentProjectionInsight(userId),
  ]);
  const all = [];
  if (closing) all.push(closing);
  if (d2) all.push(d2);
  else if (projection) all.push(projection);
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
