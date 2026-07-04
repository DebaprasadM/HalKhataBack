import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, category } = req.query;
    const where: any = { userId: req.user!.userId };
    if (startDate) where.date = { ...where.date, gte: new Date(startDate as string) };
    if (endDate) where.date = { ...where.date, lte: new Date(endDate as string) };
    if (category) where.category = category as string;
    const expenses = await prisma.expense.findMany({ where, orderBy: { date: "desc" } });
    return res.json(expenses);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount) return res.status(400).json({ error: "Description and amount are required" });
    const expense = await prisma.expense.create({
      data: { description, amount, category: category || null, date: date ? new Date(date) : undefined, userId: req.user!.userId },
    });
    return res.status(201).json(expense);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.expense.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Expense deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Expense not found" });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
