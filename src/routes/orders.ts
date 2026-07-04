import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

function generateInvoiceNo(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `INV-${yy}${mm}${dd}-${rand}`;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "20" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};
    if (search) {
      where.invoiceNo = { contains: search as string, mode: "insensitive" };
    }
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]);
    return res.json({ orders, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
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

router.post("/", async (req: Request, res: Response) => {
  try {
    const { customerId, items, discount = 0, tax = 0, paymentMethod, notes } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: "Order must have at least one item" });

    const userId = req.user!.userId;
    const subtotal = items.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0);
    const total = subtotal + tax - discount;

    const invoiceNo = generateInvoiceNo();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.productId} not found`);
          if (product.stockQty < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: product.stockQty - item.quantity },
          });
        }
      }

      return tx.order.create({
        data: {
          invoiceNo,
          customerId: customerId || null,
          userId,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod,
          notes,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId || null,
              productName: item.productName || null,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { customer: true, items: { include: { product: true } }, user: true },
      });
    });

    return res.status(201).json(order);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
