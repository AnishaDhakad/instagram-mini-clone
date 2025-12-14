import express from "express";
import { prisma } from "../prisma";
import { hashPassword, verifyPassword } from "../utils/hash";
import { signToken } from "../utils/jwt";

const router = express.Router();

/**
 * Signup
 * POST /api/auth/signup
 * body: { username, email, password }
 */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email and password are required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existing) return res.status(409).json({ message: "User with that email or username already exists" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { username, email, password: hashed } });

    const token = signToken({ id: user.id, username: user.username }, "7d");
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Login
 * POST /api/auth/login
 * body: { emailOrUsername, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: "emailOrUsername and password are required" });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] }
    });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ id: user.id, username: user.username }, "7d");
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Logout
 * POST /api/auth/logout
 */
router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
});

export default router;
