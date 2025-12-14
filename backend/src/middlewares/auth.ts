import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    username?: string;
  };
}

/**
 * Auth middleware that requires authentication.
 * Looks for token in cookie `token` first, then Authorization header.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token =
      (req.cookies && req.cookies.token) ||
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = verifyToken(token);
    req.user = { id: (payload as any).id, username: (payload as any).username };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
