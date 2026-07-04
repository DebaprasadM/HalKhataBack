import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  costPrice: z.number().positive().optional(),
  stockQty: z.number().int().min(0).default(0),
  lowStockQty: z.number().int().min(0).default(5),
  categoryId: z.number().int().positive().optional(),
});

export const updateProductSchema = createProductSchema.partial();
