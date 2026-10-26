import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"; 
import deckRoutes from "./routes/deckRoutes.js";
import cardRoutes from "./routes/cardRoutes.js";
import priceRoutes from "./routes/priceRoutes.js";
import trackedGameRoutes from "./routes/trackedGameRoutes.js";
import { verifyToken } from "./middlewares/authMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);

apiRouter.use("/games", verifyToken, gameRoutes);
apiRouter.use("/users", verifyToken, userRoutes);
apiRouter.use("/users", verifyToken, trackedGameRoutes);
apiRouter.use("/decks", verifyToken, deckRoutes);
apiRouter.use("/cards", verifyToken, cardRoutes);
apiRouter.use("/", verifyToken, priceRoutes);

app.use("/api", apiRouter);

export default app;