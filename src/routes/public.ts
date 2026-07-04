import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

router.get("/orders/:id", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, items: { include: { product: true } }, user: true },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
