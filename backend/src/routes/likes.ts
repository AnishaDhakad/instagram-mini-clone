import express from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = express.Router();

/**
 * POST /api/posts/:id/like
 */
router.post("/posts/:id/like", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    try {
      await prisma.like.create({ data: { userId, postId } });
    } catch (err: any) {
      if (err?.code === "P2002") return res.status(409).json({ message: "Already liked" });
      throw err;
    }

    const likesCount = await prisma.like.count({ where: { postId } });
    return res.status(201).json({ ok: true, likesCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/posts/:id/like
 */
router.delete("/posts/:id/like", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    const postId = req.params.id;

    const deleted = await prisma.like.deleteMany({ where: { userId, postId } });
    const likesCount = await prisma.like.count({ where: { postId } });

    return res.json({ ok: true, removed: deleted.count > 0, likesCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
