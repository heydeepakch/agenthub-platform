import { sendMessage } from "../services/chat.service.js";
import { Request, Response } from "express";
import { streamGeminiResponse } from "../services/chat.service.js";
import jwt from "jsonwebtoken";

export async function chat(req: Request, res: Response) {
  const { projectId, message } = req.body;
  const reply = await sendMessage(projectId, message);
  res.json({ reply });
}

export async function streamChat(req: Request, res: Response) {
  const { projectId } = req.params;
  const { message, token } = req.query;

  // Verify token
  try {
    jwt.verify(token as string, process.env.JWT_SECRET!);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // SSE headers - must be set before any writes
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // Disable nginx buffering
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.flushHeaders();

  // Disable response buffering
  res.socket?.setNoDelay(true);

  try {
    await streamGeminiResponse(
      projectId as string,
      message as string,
      (chunk) => {
        res.write(`data: ${chunk}\n\n`);
        // Force flush for immediate delivery
        if (typeof (res as any).flush === "function") {
          (res as any).flush();
        }
      }
    );

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: [ERROR] ${(error as Error).message}\n\n`);
    res.end();
  }
}
