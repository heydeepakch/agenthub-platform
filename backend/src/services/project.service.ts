import { prisma } from "../db/prisma.js";

export function createProject(userId: string, name: string, prompt: string) {
  return prisma.project.create({
    data: { userId, name, prompt }
  });
}

export function getProjects(userId: string) {
  return prisma.project.findMany({ where: { userId } });
}
