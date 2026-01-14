import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import chatRoutes from "./routes/chat.routes.js";


const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
