import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import * as authService from "./auth.service";

const router = Router();

router.post("/register", async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(result);
});

router.post("/login", async (req, res) => {
  const result = await authService.login(req.body);
  res.json(result);
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const user = await authService.getMe(req.user!.id);
  res.json({ user });
});

export default router;
