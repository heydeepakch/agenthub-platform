import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../utils/validators.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data.email, data.password);
    res.json({ id: user.id, email: user.email });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);
    const token = await loginUser(data.email, data.password);
    res.json({ token });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
}
