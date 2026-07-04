import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import pg from "pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const existingUser = await prisma.user.findUnique({ where: { email: "owner@demo.com" } });
  if (existingUser) {
    console.log("Seed data already exists, skipping.");
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("demo123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Demo Owner",
      email: "owner@demo.com",
      passwordHash,
      businessName: "Demo Store",
      role: "owner",
    },
  });
  console.log("Created user: owner@demo.com / demo123");

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Groceries", description: "Daily grocery items" } }),
    prisma.category.create({ data: { name: "Beverages", description: "Drinks and beverages" } }),
    prisma.category.create({ data: { name: "Dairy", description: "Milk and dairy products" } }),
    prisma.category.create({ data: { name: "Bakery", description: "Bread, cakes and pastries" } }),
    prisma.category.create({ data: { name: "Snacks", description: "Chips, cookies and snacks" } }),
    prisma.category.create({ data: { name: "Electronics", description: "Electronic accessories" } }),
    prisma.category.create({ data: { name: "Household", description: "Home and cleaning items" } }),
    prisma.category.create({ data: { name: "Personal Care", description: "Health and beauty" } }),
  ]);
  console.log(`Created ${categories.length} categories`);

  const productsData = [
    { name: "Basmati Rice 1kg", sku: "GRC001", price: 3.99, costPrice: 2.80, stockQty: 50, lowStockQty: 10, categoryIdx: 0 },
    { name: "Toor Dal 500g", sku: "GRC002", price: 2.49, costPrice: 1.70, stockQty: 40, lowStockQty: 10, categoryIdx: 0 },
    { name: "Cooking Oil 1L", sku: "GRC003", price: 5.99, costPrice: 4.20, stockQty: 30, lowStockQty: 8, categoryIdx: 0 },
    { name: "Sugar 1kg", sku: "GRC004", price: 1.99, costPrice: 1.40, stockQty: 60, lowStockQty: 15, categoryIdx: 0 },
    { name: "Wheat Flour 1kg", sku: "GRC005", price: 2.29, costPrice: 1.60, stockQty: 45, lowStockQty: 10, categoryIdx: 0 },
    { name: "Salt 1kg", sku: "GRC006", price: 0.99, costPrice: 0.50, stockQty: 80, lowStockQty: 20, categoryIdx: 0 },
    { name: "Mixed Spices 100g", sku: "GRC007", price: 1.49, costPrice: 0.90, stockQty: 35, lowStockQty: 10, categoryIdx: 0 },

    { name: "Cola 355ml Can", sku: "BEV001", price: 1.29, costPrice: 0.80, stockQty: 100, lowStockQty: 20, categoryIdx: 1 },
    { name: "Orange Juice 1L", sku: "BEV002", price: 3.49, costPrice: 2.30, stockQty: 25, lowStockQty: 8, categoryIdx: 1 },
    { name: "Mineral Water 1L", sku: "BEV003", price: 0.89, costPrice: 0.40, stockQty: 120, lowStockQty: 30, categoryIdx: 1 },
    { name: "Green Tea 20 bags", sku: "BEV004", price: 2.99, costPrice: 2.00, stockQty: 20, lowStockQty: 6, categoryIdx: 1 },
    { name: "Coffee Powder 200g", sku: "BEV005", price: 4.99, costPrice: 3.50, stockQty: 15, lowStockQty: 5, categoryIdx: 1 },

    { name: "Whole Milk 1L", sku: "DRY001", price: 1.79, costPrice: 1.20, stockQty: 40, lowStockQty: 10, categoryIdx: 2 },
    { name: "Plain Yogurt 500g", sku: "DRY002", price: 2.49, costPrice: 1.70, stockQty: 25, lowStockQty: 8, categoryIdx: 2 },
    { name: "Butter 200g", sku: "DRY003", price: 3.29, costPrice: 2.30, stockQty: 20, lowStockQty: 6, categoryIdx: 2 },
    { name: "Cheese Slices 200g", sku: "DRY004", price: 3.99, costPrice: 2.80, stockQty: 15, lowStockQty: 5, categoryIdx: 2 },
    { name: "Cream 200ml", sku: "DRY005", price: 2.19, costPrice: 1.50, stockQty: 18, lowStockQty: 5, categoryIdx: 2 },

    { name: "White Bread 400g", sku: "BAK001", price: 1.99, costPrice: 1.20, stockQty: 30, lowStockQty: 8, categoryIdx: 3 },
    { name: "Chocolate Cake Slice", sku: "BAK002", price: 3.49, costPrice: 2.20, stockQty: 12, lowStockQty: 4, categoryIdx: 3 },
    { name: "Butter Croissant", sku: "BAK003", price: 1.49, costPrice: 0.80, stockQty: 20, lowStockQty: 6, categoryIdx: 3 },
    { name: "Whole Wheat Bread", sku: "BAK004", price: 2.49, costPrice: 1.60, stockQty: 25, lowStockQty: 8, categoryIdx: 3 },
    { name: "Muffin Blueberry", sku: "BAK005", price: 1.99, costPrice: 1.10, stockQty: 15, lowStockQty: 4, categoryIdx: 3 },

    { name: "Potato Chips 150g", sku: "SNK001", price: 1.99, costPrice: 1.20, stockQty: 50, lowStockQty: 15, categoryIdx: 4 },
    { name: "Chocolate Cookies 200g", sku: "SNK002", price: 2.49, costPrice: 1.60, stockQty: 35, lowStockQty: 10, categoryIdx: 4 },
    { name: "Mixed Nuts 200g", sku: "SNK003", price: 4.99, costPrice: 3.50, stockQty: 18, lowStockQty: 5, categoryIdx: 4 },
    { name: "Granola Bar 50g", sku: "SNK004", price: 1.29, costPrice: 0.70, stockQty: 60, lowStockQty: 15, categoryIdx: 4 },
    { name: "Popcorn 100g", sku: "SNK005", price: 1.49, costPrice: 0.80, stockQty: 40, lowStockQty: 10, categoryIdx: 4 },

    { name: "USB Cable 1m", sku: "ELC001", price: 5.99, costPrice: 3.50, stockQty: 30, lowStockQty: 8, categoryIdx: 5 },
    { name: "Phone Case Universal", sku: "ELC002", price: 8.99, costPrice: 5.00, stockQty: 20, lowStockQty: 6, categoryIdx: 5 },
    { name: "AA Batteries 4-pack", sku: "ELC003", price: 3.99, costPrice: 2.20, stockQty: 40, lowStockQty: 10, categoryIdx: 5 },
    { name: "LED Bulb 9W", sku: "ELC004", price: 4.49, costPrice: 3.00, stockQty: 25, lowStockQty: 8, categoryIdx: 5 },
    { name: "Power Bank 10000mAh", sku: "ELC005", price: 19.99, costPrice: 13.00, stockQty: 10, lowStockQty: 3, categoryIdx: 5 },

    { name: "Dish Soap 500ml", sku: "HOU001", price: 2.29, costPrice: 1.40, stockQty: 35, lowStockQty: 10, categoryIdx: 6 },
    { name: "Laundry Detergent 1kg", sku: "HOU002", price: 6.99, costPrice: 4.50, stockQty: 20, lowStockQty: 6, categoryIdx: 6 },
    { name: "All-Purpose Cleaner 750ml", sku: "HOU003", price: 3.49, costPrice: 2.20, stockQty: 25, lowStockQty: 8, categoryIdx: 6 },
    { name: "Trash Bags 30-pack", sku: "HOU004", price: 4.99, costPrice: 3.00, stockQty: 30, lowStockQty: 10, categoryIdx: 6 },
    { name: "Paper Towels 6-roll", sku: "HOU005", price: 5.49, costPrice: 3.50, stockQty: 15, lowStockQty: 5, categoryIdx: 6 },

    { name: "Toothpaste 100g", sku: "PCR001", price: 2.99, costPrice: 1.80, stockQty: 40, lowStockQty: 10, categoryIdx: 7 },
    { name: "Shampoo 200ml", sku: "PCR002", price: 4.49, costPrice: 3.00, stockQty: 25, lowStockQty: 8, categoryIdx: 7 },
    { name: "Hand Soap 250ml", sku: "PCR003", price: 2.49, costPrice: 1.50, stockQty: 30, lowStockQty: 10, categoryIdx: 7 },
    { name: "Body Lotion 200ml", sku: "PCR004", price: 5.99, costPrice: 4.00, stockQty: 15, lowStockQty: 5, categoryIdx: 7 },
    { name: "Sanitizer 100ml", sku: "PCR005", price: 1.99, costPrice: 1.00, stockQty: 50, lowStockQty: 15, categoryIdx: 7 },
  ];

  const products = await Promise.all(
    productsData.map((p) =>
      prisma.product.create({
        data: {
          name: p.name,
          sku: p.sku,
          price: p.price,
          costPrice: p.costPrice,
          stockQty: p.stockQty,
          lowStockQty: p.lowStockQty,
          categoryId: categories[p.categoryIdx].id,
        },
      })
    )
  );
  console.log(`Created ${products.length} products`);

  const customers = await Promise.all([
    prisma.customer.create({ data: { name: "John Smith", email: "john@example.com", phone: "555-0101", address: "123 Main St" } }),
    prisma.customer.create({ data: { name: "Sarah Johnson", email: "sarah@example.com", phone: "555-0102", address: "456 Oak Ave" } }),
    prisma.customer.create({ data: { name: "Mike Brown", email: "mike@example.com", phone: "555-0103", creditBalance: 15.50 } }),
    prisma.customer.create({ data: { name: "Emily Davis", email: "emily@example.com", phone: "555-0104" } }),
    prisma.customer.create({ data: { name: "Robert Wilson", email: "robert@example.com", phone: "555-0105", address: "789 Pine Rd" } }),
  ]);
  console.log(`Created ${customers.length} customers`);

  function generateInvoiceNo(idx: number): string {
    const date = new Date();
    const yy = date.getFullYear().toString().slice(-2);
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const dd = date.getDate().toString().padStart(2, "0");
    return `INV-${yy}${mm}${dd}-${String(idx + 1).padStart(4, "0")}`;
  }

  const ordersData = [
    { customerIdx: 0, items: [{ productIdx: 0, qty: 2 }, { productIdx: 3, qty: 1 }, { productIdx: 7, qty: 4 }], paymentMethod: "cash" },
    { customerIdx: 1, items: [{ productIdx: 13, qty: 1 }, { productIdx: 16, qty: 2 }, { productIdx: 20, qty: 3 }], paymentMethod: "card" },
    { customerIdx: null, items: [{ productIdx: 6, qty: 1 }, { productIdx: 22, qty: 2 }], paymentMethod: "cash" },
    { customerIdx: 2, items: [{ productIdx: 30, qty: 2 }, { productIdx: 31, qty: 1 }, { productIdx: 35, qty: 1 }], paymentMethod: "upi" },
    { customerIdx: null, items: [{ productIdx: 18, qty: 2 }, { productIdx: 24, qty: 1 }], paymentMethod: "cash" },
    { customerIdx: 3, items: [{ productIdx: 8, qty: 3 }, { productIdx: 11, qty: 1 }, { productIdx: 38, qty: 2 }], paymentMethod: "card" },
    { customerIdx: 0, items: [{ productIdx: 1, qty: 2 }, { productIdx: 4, qty: 1 }, { productIdx: 27, qty: 1 }], paymentMethod: "cash" },
    { customerIdx: 4, items: [{ productIdx: 33, qty: 2 }, { productIdx: 36, qty: 3 }], paymentMethod: "credit" },
  ];

  for (let i = 0; i < ordersData.length; i++) {
    const order = ordersData[i];
    const items = order.items.map((item) => {
      const prod = products[item.productIdx];
      return { productId: prod.id, quantity: item.qty, unitPrice: Number(prod.price), totalPrice: Number(prod.price) * item.qty };
    });
    const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const discount = i % 2 === 0 ? 0 : Math.round(subtotal * 0.05 * 100) / 100;
    const total = subtotal + tax - discount;

    await prisma.order.create({
      data: {
        invoiceNo: generateInvoiceNo(i),
        customerId: order.customerIdx !== null ? customers[order.customerIdx].id : null,
        userId: user.id,
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: order.paymentMethod,
        status: "completed",
        items: { create: items },
      },
    });

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }
  }
  console.log(`Created ${ordersData.length} orders`);

  const expenses = await Promise.all([
    prisma.expense.create({ data: { description: "Monthly Rent", amount: 1200, category: "Rent", userId: user.id } }),
    prisma.expense.create({ data: { description: "Electricity Bill", amount: 245.50, category: "Utilities", userId: user.id } }),
    prisma.expense.create({ data: { description: "Internet Service", amount: 79.99, category: "Utilities", userId: user.id } }),
    prisma.expense.create({ data: { description: "Cleaning Supplies", amount: 45.00, category: "Supplies", userId: user.id } }),
    prisma.expense.create({ data: { description: "Employee Wages", amount: 1800, category: "Payroll", userId: user.id } }),
  ]);
  console.log(`Created ${expenses.length} expenses`);

  await prisma.$disconnect();
  console.log("Seeding complete!");
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
