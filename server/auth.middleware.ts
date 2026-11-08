import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

declare module "express" {
  interface Request {
    user?: any;
  }
}

export const tokenBlacklist = new Map<string, number>()

function isTokenBlacklisted(token: string): boolean {
  const expiresAt = tokenBlacklist.get(token);
  if (!expiresAt) return false;
  const now = Date.now();
  if (expiresAt < now) {
    tokenBlacklist.delete(token); // optional: clean up early
    return false;
  }
  return true;
}


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  const secret = process.env.JWT_SECRET!;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if(isTokenBlacklisted(token)){
    return res.status(401).json({message: 'Invalid token'})
  }

  try {
    const decoded: any = jwt.verify(token, secret);
    let finalDecoded = {}
    if(decoded.user){
      finalDecoded = decoded.user
    }
    finalDecoded = decoded
    req.user = finalDecoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }

};

export default authMiddleware;