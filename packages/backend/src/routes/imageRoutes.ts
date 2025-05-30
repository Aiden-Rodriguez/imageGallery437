import express, { Request, Response } from "express";
import { ImageProvider } from "../imageProvider";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  app.get("/api/images", async (req: Request, res: Response) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); 
      const images = await imageProvider.getAllImages();
      res.status(200).json(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}