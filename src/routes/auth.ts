import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { authenticate } from "../middleware/auth";
import { registerSchema, loginSchema } from "../schemas/auth";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        businessName: data.businessName,
      },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, businessName: user.businessName, role: user.role },
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);
    console.log("[Login] Attempt for:", data.email);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, businessName: user.businessName, role: user.role },
    });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: err.errors });
    console.error("[Login] Error:", err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

router.get("/me", authenticate, async (req: Request, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
