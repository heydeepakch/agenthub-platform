import { sendMessage } from "../services/chat.service.js";
import { Request, Response } from "express";

export async function chat(req: Request, res: Response) {
  const { projectId, message } = req.body;
  const reply = await sendMessage(projectId, message);
  res.json({ reply });
}
