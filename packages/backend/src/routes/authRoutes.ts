import express, { Request, Response, NextFunction } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: IAuthTokenPayload
    }
}

export function verifyAuthToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.get("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).end();
    } else {
        jwt.verify(token, req.app.locals.JWT_SECRET as string, (error, decoded) => {
            if (decoded) {
                req.user = decoded as IAuthTokenPayload;
                next();
            } else {
                res.status(403).end();
            }
        });
    }
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {
  app.post("/auth/register", async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          error: "Bad request",
          message: "Missing username or password",
        });
        return;
      }

      const success = await credentialsProvider.registerUser(username, password);

      if (!success) {
        res.status(409).json({
          error: "Username already taken",
          message: "A user with this username already exists",
        });
        return;
      }

      const jwtSecret = req.app.locals.JWT_SECRET;
      const token = await generateAuthToken(username, jwtSecret);
      res.status(201).json({ token });
    } catch (error) {
      console.error("Failed to register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });


  app.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({
          error: "Bad request",
          message: "Missing username or password",
        });
        return;
      }
      
      const isValid = await credentialsProvider.verifyPassword(username, password);
      
      if (!isValid) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid username or password",
        });
        return;
      }
      
      const jwtSecret = req.app.locals.JWT_SECRET;
      const token = await generateAuthToken(username, jwtSecret);
      res.status(200).json({ token });
    } catch (error) {
      console.error("Failed to login:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}