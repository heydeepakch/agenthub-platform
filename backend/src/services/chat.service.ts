import { prisma } from "../db/prisma.js";
import OpenAI from "openai";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

// Helper to ensure messages alternate (merge consecutive same-role messages)
function ensureAlternating(
  msgs: { role: "user" | "assistant"; content: string }[]
): { role: "user" | "assistant"; content: string }[] {
  if (msgs.length === 0) return [];

  const result: { role: "user" | "assistant"; content: string }[] = [];

  for (const msg of msgs) {
    const last = result[result.length - 1];
    if (last && last.role === msg.role) {
      // Merge consecutive same-role messages
      last.content += "\n" + msg.content;
    } else {
      result.push({ ...msg });
    }
  }

  return result;
}

export async function sendMessage(projectId: string, content: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  // Save user message first
  await prisma.message.create({
    data: { content, role: "user", projectId },
  });

  // Fetch all messages in order (including the one we just saved)
  const allMessages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const historyMessages = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Ensure proper alternation
  const alternatingMessages = ensureAlternating(historyMessages);

  const messages = [
    { role: "system" as const, content: project.prompt },
    ...alternatingMessages,
  ];

  const response = await perplexity.chat.completions.create({
    model: "sonar",
    messages,
  });

  const reply = response.choices[0].message.content || "";

  await prisma.message.create({
    data: { content: reply, role: "assistant", projectId },
  });

  return reply;
}

export async function streamGeminiResponse(
  projectId: string,
  content: string,
  onChunk: (text: string) => void
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) throw new Error("Project not found");

  // Save user message first
  await prisma.message.create({
    data: { content, role: "user", projectId },
  });

  // Fetch all messages in order (including the one we just saved)
  const allMessages = await prisma.message.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
  });

  const historyMessages = allMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  // Ensure proper alternation
  const alternatingMessages = ensureAlternating(historyMessages);

  const messages = [
    { role: "system" as const, content: project.prompt },
    ...alternatingMessages,
  ];

  const stream = await perplexity.chat.completions.create({
    model: "sonar",
    messages,
    stream: true,
  });

  let fullReply = "";

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) {
      fullReply += text;
      onChunk(text);
    }
  }

  await prisma.message.create({
    data: { content: fullReply, role: "assistant", projectId },
  });
}
