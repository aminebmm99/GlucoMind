import userRoutes from "./routes/user.routes";
import express from "express";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import * as healthProfileRoutesModule from "./routes/health-profile.routes";

const healthProfileRoutes =
  (healthProfileRoutesModule as any).healthProfileRoutes ??
  (healthProfileRoutesModule as any).router ??
  (healthProfileRoutesModule as any).default;

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health-profile", healthProfileRoutes);
app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running",
  });
});

app.get("/api/db-health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "OK",
      database: "PostgreSQL connected",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "ERROR",
      database: "PostgreSQL connection failed",
    });
  }
});
app.use("/api/users", userRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
