import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../utils/validators.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { Prisma } from "@prisma/client";

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data.email, data.password);
    res.json({ id: user.id, email: user.email });
  } catch (e) {
    // Prisma unique constraint error (duplicate email)
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(400).json({ error: "Email already registered" });
    }
    // Zod validation error
    if (e instanceof Error && e.name === "ZodError") {
      return res.status(400).json({ error: "Invalid email or password format" });
    }
    res.status(400).json({ error: (e as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const token = await loginUser(data.email, data.password);
    res.json({ token });
  } catch (e) {
    // Zod validation error
    if (e instanceof Error && e.name === "ZodError") {
      return res.status(400).json({ error: "Invalid email or password format" });
    }
    // Invalid credentials (from auth service)
    if (e instanceof Error && e.message === "Invalid credentials") {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.status(400).json({ error: (e as Error).message });
  }
}