import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { thermalPrint } from "../lib/thermal-print";

const router = Router();
router.use(authenticate);

router.post("/order/:id", async (req: Request, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { customer: true, items: { include: { product: true } } },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const printOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      tax: Number(order.tax),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    };

    await thermalPrint(printOrder);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
