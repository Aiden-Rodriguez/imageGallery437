import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./imageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { UserProvider } from "./userProvider";
import { verifyAuthToken } from "./routes/authRoutes";


dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

async function startServer() {
  const mongoClient = connectMongo();
  await mongoClient.connect();

  const imageProvider = new ImageProvider(mongoClient);
  const credentialsProvider  = new CredentialsProvider(mongoClient)
  const usersProvider  = new UserProvider(mongoClient)
  const app = express();
  app.use(express.json());
  app.use(express.static(STATIC_DIR));
  app.use("/uploads", express.static("uploads"));
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment variables");
  }
  app.locals.JWT_SECRET = JWT_SECRET;
  
  app.use("/api/*", verifyAuthToken);
  registerImageRoutes(app, imageProvider);
  registerAuthRoutes(app, credentialsProvider, usersProvider);

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
