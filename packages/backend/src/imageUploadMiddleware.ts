import { Request, NextFunction, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

class ImageFormatError extends Error {}

const storageEngine = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.PATH_TO_UPLOADS || "uploads";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const mimeType = file.mimetype;
    let fileExtension;

    if (mimeType === "image/png") {
      fileExtension = "png";
    } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      fileExtension = "jpg";
    } else {
      return cb(new ImageFormatError("Unsupported image type"), "");
    }

    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${fileExtension}`;
    cb(null, fileName);
  }
});

export const imageMiddlewareFactory = multer({
  storage: storageEngine,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export function handleImageFileErrors(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    res.status(400).send({
      error: "Bad Request",
      message: err.message,
    });
    return;
  }
  if (err instanceof ImageFormatError) {
    res.status(415).send({
      error: "Unsupported Media Type",
      message: err.message,
    });
    return;
  }
  next(err); // Let other error middleware handle it
}