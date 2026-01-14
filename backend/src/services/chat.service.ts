import { prisma } from "../db/prisma.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function sendMessage(projectId: string, content: string) {
  
   // Load project + chat history
   const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { messages: true }
  });

  if (!project) throw new Error("Project not found");

  // Save user message
  await prisma.message.create({
    data: { content, role: "user", projectId }
  });
  
  // Build conversation
  const history = project.messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const chat = model.startChat({
    history,
    systemInstruction: {
      role: "system",
      parts: [{ text: project.prompt }]
    }
  });

  const result = await chat.sendMessage(content);
  const reply = result.response.text();

  // Save assistant reply
  await prisma.message.create({
    data: { content: reply, role: "assistant", projectId }
  });

  return reply;
}

export async function streamGeminiResponse(projectId: string, content: string, onChunk: (text: string) => void) {
    // Load project + chat history
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { messages: true }
    });
  
    if (!project) throw new Error("Project not found");
  
    // Save user message
    await prisma.message.create({
      data: { content, role: "user", projectId }
    });
  
    // Build conversation
    const history = project.messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));
  
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
    const chat = model.startChat({
      history,
      systemInstruction: {
        role: "system",
        parts: [{ text: project.prompt }]
      }
    });
  
    const result = await chat.sendMessageStream(content);
  
    let fullReply = "";
  
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullReply += text;
      onChunk(text);
    }
  
    await prisma.message.create({ data: { content: fullReply, role: "assistant", projectId } });
  }