import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { createProductSchema, updateProductSchema } from "../schemas/product";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, categoryId, lowStock } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { sku: { contains: search as string, mode: "insensitive" } },
        { barcode: { contains: search as string, mode: "insensitive" } },
      ];
    }
    if (categoryId) where.categoryId = Number(categoryId);
    if (lowStock === "true") {
      where.stockQty = { lte: prisma.product.fields.lowStockQty };
    }
    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return res.json(products);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json(product);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await prisma.product.create({ data, include: { category: true } });
    return res.status(201).json(product);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    if (err.code === "P2002") return res.status(409).json({ error: "SKU already exists" });
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const data = updateProductSchema.parse(req.body);
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data,
      include: { category: true },
    });
    return res.json(product);
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    if (err.code === "P2025") return res.status(404).json({ error: "Product not found" });
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Product deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Product not found" });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
