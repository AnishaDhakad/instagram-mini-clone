import express from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = express.Router();

/**
 * POST /api/posts
 * body: { imageUrl, caption }
 */
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { imageUrl, caption } = req.body;
    if (!imageUrl) return res.status(400).json({ message: "imageUrl is required" });

    const post = await prisma.post.create({
      data: { authorId: req.user.id, imageUrl, caption: caption || "" }
    });

    return res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * GET /api/posts/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    if (!post) return res.status(404).json({ message: "Post not found" });
    return res.json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/posts/:id
 * Only owner can delete
 */
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.authorId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await prisma.post.delete({ where: { id } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
