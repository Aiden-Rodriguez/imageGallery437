import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./imageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

async function startServer() {
  const mongoClient = connectMongo();
  await mongoClient.connect();

  const imageProvider = new ImageProvider(mongoClient);

  const app = express();
  app.use(express.json());
  app.use(express.static(STATIC_DIR));

  registerImageRoutes(app, imageProvider);

  app.get(Object.values(ValidRoutes), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
