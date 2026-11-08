import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { log } from "./logger";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

let initialized = false;
let initError: Error | null = null;
const initPromise = registerRoutes(app)
  .then(() => {
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      try {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
      } catch {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
    initialized = true;
  })
  .catch((err: Error) => {
    initError = err;
    log("Failed to initialize routes:", err);
  });

export default async function handler(req: any, res: any) {
  if (initError) {
    return res.status(500).json({ message: "Server initialization failed" });
  }
  if (!initialized) {
    await initPromise;
  }
  return app(req, res);
}
