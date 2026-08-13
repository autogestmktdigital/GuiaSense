import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { requireAccess } from "../../middleware/requireAccess";
import * as transactionsService from "./transactions.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const month = typeof req.query.month === "string" ? req.query.month : undefined;
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const transactions = await transactionsService.listTransactions(req.user!.id, { month, type });
  res.json({ transactions });
});

router.post("/", requireAccess, async (req: AuthRequest, res) => {
  const result = await transactionsService.createTransaction(req.user!.id, req.body);
  res.status(201).json({ transaction: result.transaction, created: result.created });
});

router.patch("/:id", requireAccess, async (req: AuthRequest, res) => {
  const transaction = await transactionsService.updateTransaction(req.user!.id, req.params.id, req.body);
  res.json({ transaction });
});

router.delete("/:id", requireAccess, async (req: AuthRequest, res) => {
  const result = await transactionsService.deleteTransaction(req.user!.id, req.params.id);
  res.json(result);
});

export default router;
