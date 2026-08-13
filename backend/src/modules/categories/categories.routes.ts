import { Router } from "express";
import { requireAuth, AuthRequest } from "../../middleware/auth";
import { requireAccess } from "../../middleware/requireAccess";
import * as categoriesService from "./categories.service";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res) => {
  const categories = await categoriesService.listCategories(
    req.user!.id,
    typeof req.query.type === "string" ? req.query.type : undefined,
  );
  res.json({ categories });
});

router.post("/", requireAccess, async (req: AuthRequest, res) => {
  const category = await categoriesService.createCategory(req.user!.id, req.body);
  res.status(201).json({ category });
});

router.patch("/:id", requireAccess, async (req: AuthRequest, res) => {
  const category = await categoriesService.updateCategory(req.user!.id, req.params.id, req.body);
  res.json({ category });
});

router.delete("/:id", requireAccess, async (req: AuthRequest, res) => {
  const result = await categoriesService.deleteCategory(req.user!.id, req.params.id);
  res.json(result);
});

export default router;
