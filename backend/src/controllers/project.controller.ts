import { createProject, getProjects } from "../services/project.service.js";
import { Request, Response } from "express";

export async function create(req: Request, res: Response) {
  const { name, prompt } = req.body;
  const project = await createProject((req as any).user.userId, name, prompt);
  res.json(project);
}

export async function list(req: Request, res: Response) {
  const projects = await getProjects((req as any).user.userId);
  res.json(projects);
}
