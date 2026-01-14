import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { create, list } from "../controllers/project.controller.js";
import { getOne } from "../controllers/project.controller.js";

const router = Router();

router.post("/", auth, create);
router.get("/", auth, list);
router.get("/:id", auth, getOne);

export default router;