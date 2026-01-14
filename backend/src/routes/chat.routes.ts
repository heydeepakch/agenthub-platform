import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { chat, streamChat } from "../controllers/chat.controller.js";

const router = Router();
router.post("/", auth, chat);
router.get("/stream/:projectId", streamChat);

export default router;
