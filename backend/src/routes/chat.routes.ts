import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { chat } from "../controllers/chat.controller.js";

const router = Router();
router.post("/", auth, chat);
export default router;
