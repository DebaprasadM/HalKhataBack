import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
      ];
    }
    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
    });
    return res.json(customers);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(req.params.id) },
      include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } },
    });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    return res.json(customer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const customer = await prisma.customer.create({ data: { name, email, phone, address } });
    return res.status(201).json(customer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, email, phone, address },
    });
    return res.json(customer);
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Customer not found" });
    return res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Customer deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Customer not found" });
    return res.status(500).json({ error: err.message });
  }
});

export default router;
