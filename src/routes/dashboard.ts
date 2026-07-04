import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, totalProducts, totalCustomers, lowStockProducts, recentOrders] = await Promise.all([
      prisma.order.findMany({
        where: { userId, createdAt: { gte: today, lt: tomorrow } },
      }),
      prisma.product.count(),
      prisma.customer.count(),
      prisma.product.findMany({
        where: { stockQty: { lte: prisma.product.fields.lowStockQty } },
        select: { id: true, name: true, stockQty: true, lowStockQty: true },
      }),
      prisma.order.findMany({
        where: { userId },
        include: { customer: true, items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const todaySales = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);
    const todayOrdersCount = todayOrders.length;

    return res.json({
      todaySales,
      todayOrdersCount,
      totalProducts,
      totalCustomers,
      lowStockProducts,
      recentOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
