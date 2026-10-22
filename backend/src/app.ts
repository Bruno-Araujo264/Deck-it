import express from "express";
import cors from "cors";
import gameRoutes from "./routes/gameRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const apiRouter = express.Router();


apiRouter.use("/games", gameRoutes);

app.use("/api", apiRouter);

export default app;