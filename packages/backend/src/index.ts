import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { ValidRoutes } from "./shared/ValidRoutes";
import { fetchDataFromServer } from "./common/ApiImageData";


dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req: Request, res: Response) => {
    try {
      const images = await fetchDataFromServer();
      res.status(200).json(images);
    } catch (error) {
      console.error("Failed to fetch images:", error);
      res.status(500).json({ error: "Internal server error: Could not fetch images." });
    }
  });

app.get(Object.values(ValidRoutes), (req, res) => {
    res.sendFile("index.html", { root: STATIC_DIR });
  });

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
