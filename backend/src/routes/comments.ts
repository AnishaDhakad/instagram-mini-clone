import express from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = express.Router();

/**
 * POST /api/posts/:id/comments
 * body: { text }
 */
router.post("/posts/:id/comments", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    const postId = req.params.id;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = await prisma.comment.create({ data: { userId, postId, text } });
    return res.status(201).json({ comment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/posts/:id/comments
 */
router.get("/posts/:id/comments", async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { id: true, username: true, avatarUrl: true } } }
    });
    return res.json({ comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
