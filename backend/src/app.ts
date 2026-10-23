import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middlewares/authMiddleware.js"; // <-- Importa o middleware

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const apiRouter = express.Router();

// Rotas de autenticação continuam públicas (registro e login)
apiRouter.use("/auth", authRoutes);

// TODAS as rotas de games agora passam pelo verifyToken automaticamente!
apiRouter.use("/games", verifyToken, gameRoutes);

app.use("/api", apiRouter);

export default app;