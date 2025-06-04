import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { ImageProvider } from "../imageProvider";
import { imageMiddlewareFactory, handleImageFileErrors } from "../imageUploadMiddleware";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
  app.get("/api/images", async (req: Request, res: Response) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const nameSubstring = req.query.substring?.toString();
      const allImages = await imageProvider.getImages(nameSubstring);

      res.status(200).json(allImages);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/images/:imageId", async (req: Request, res: Response): Promise<void> => {
    const MAX_NAME_LENGTH = 100;

    try {
      const imageId = req.params.imageId;
      const newName = req.body.name;

      if (!newName || typeof newName !== "string") {
        res.status(400).json({ error: "Missing or invalid 'name' in request body" });
        return;
      }

      if (newName.length > MAX_NAME_LENGTH) {
        res.status(422).send({
          error: "Unprocessable Entity",
          message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
        });
        return;
      }
    
      const image = await imageProvider.getImageById(imageId);
      if (!image) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      const loggedInUser = req.user?.username;
      if (image.authorId !== loggedInUser) {
        res.status(403).json({
          error: "Forbidden",
          message: "You do not have permission to modify this image",
        });
        return;
      }

      const matchedCount = await imageProvider.updateImageName(imageId, newName);

      if (matchedCount === 0) {
        res.status(404).json({ error: "Image not found" });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error("Failed to update image name:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post(
    "/api/images",
    imageMiddlewareFactory.single("image"),
    handleImageFileErrors,
    async (req: Request, res: Response) => {
      try {
        const loggedInUser = req.user?.username;
        if (!loggedInUser) {
          res.status(401).json({
            error: "Unauthorized",
            message: "You must be logged in to upload an image",
          });
          return;
        }

        if (!req.file) {
          res.status(400).json({
            error: "Bad Request",
            message: "No image file provided",
          });
          return;
        }

        const name = req.body.name;
        const MAX_NAME_LENGTH = 100;
        if (!name || typeof name !== "string") {
          res.status(400).json({
            error: "Bad Request",
            message: "Missing or invalid 'name' in request body",
          });
          return;
        }
        if (name.length > MAX_NAME_LENGTH) {
          res.status(422).json({
            error: "Unprocessable Entity",
            message: `Image name exceeds ${MAX_NAME_LENGTH} characters`,
          });
          return;
        }

        // Store image metadata in database
        const imageData = {
          name,
          authorId: loggedInUser,
          src: `/uploads/${req.file.filename}`,
        };

        // console.log(imageData)
        await imageProvider.createImage(imageData);

        res.status(201).json({ message: "Image uploaded successfully!" });
      } catch (error) {
        console.error("Failed to upload image:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
}