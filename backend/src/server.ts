import "dotenv/config";
import express from "express";
import authRoutes from "./routes/auth.routes.js";



const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});
