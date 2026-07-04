import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const category = await prisma.category.create({ data: { name, description } });
    return res.status(201).json(category);
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Category already exists" });
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: { name, description },
    });
    return res.json(category);
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Category name already exists" });
    if (err.code === "P2025") return res.status(404).json({ error: "Category not found" });
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Category deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Category not found" });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
