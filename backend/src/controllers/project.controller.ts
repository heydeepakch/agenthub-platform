import { createProject, getProjects } from "../services/project.service.js";
import { Request, Response } from "express";
import { getProjectWithMessages } from "../services/project.service.js";

export async function create(req: Request, res: Response) {
  const { name, prompt } = req.body;
  const project = await createProject((req as any).user.userId, name, prompt);
  res.json(project);
}

export async function list(req: Request, res: Response) {
  const projects = await getProjects((req as any).user.userId);
  res.json(projects);
}

export async function getOne(req: Request, res: Response) {
    const project = await getProjectWithMessages(req.params.id as string, (req as any).user.userId);
    if (!project) return res.status(404).json({ error: "Not found" });
    res.json(project);
  }