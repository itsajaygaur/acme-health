import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import  cookieParser  from "cookie-parser";
import cron from 'node-cron'
import { tokenBlacklist } from "./auth.middleware";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  const payload = req.body
  res.on("finish", () => {
    const user = (req as any).user?.name || ''
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${user} ${req.method} ${path} ${res.statusCode} in ${duration}ms`;
    //  if (capturedJsonResponse) {
    //    logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    //  }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      if(payload?.password)  delete payload.password
      // log(logLine, '\n request_payload => ', payload, '\n response => ', capturedJsonResponse);
    }
  });

  next();
});

//clear baclklisted tokens
cron.schedule('*/5 * * * *', () => {
  // console.log('token before ', tokenBlacklist)
  const now = Date.now();
  for (const [token, expiresAt] of tokenBlacklist) {
    if (expiresAt < now) {
      tokenBlacklist.delete(token);
    }
  }
  // console.log('token after ', tokenBlacklist)
  // console.log('🧹 Cleaned up expired tokens');
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

//write a error handler 
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  try {
    res.on("error", (err) => {
      console.error("Error in response:", err);
      return res.status(status).json({ message });
    });
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(status).json({ message });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    
  }
  // throw err;
});

(async () => {
  await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  try {
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
  
    res.status(status).json({ message });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    
  }
  // throw err;
});

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // process.setUncaughtExceptionCaptureCallback((err) => {
  //   console.error(err);
  //   // process.exit(1);
  // });

  process.setUncaughtExceptionCaptureCallback(err => {
    log('Unhandled exception error ==> ', err)
  })
 
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    log(
      `Server running at http://localhost:${PORT}`
    );
  });


})();
