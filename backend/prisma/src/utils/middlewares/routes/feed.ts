import express from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = express.Router();

/**
 * GET /api/feed?page=1&limit=10
 * Returns paginated posts from users the current user follows.
 * Auth required.
 */
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const currentUserId = req.user.id;

    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "10", 10)));
    const skip = (page - 1) * limit;

    const follows = await prisma.follow.findMany({ where: { followerId: currentUserId }, select: { followingId: true } });
    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) return res.json({ meta: { page, limit, total: 0 }, data: [] });

    const total = await prisma.post.count({ where: { authorId: { in: followingIds } } });

    const posts = await prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        _count: { select: { likes: true, comments: true } },
        likes: { where: { userId: currentUserId }, select: { id: true } }
      }
    });

    const data = posts.map((p) => ({
      id: p.id,
      imageUrl: p.imageUrl,
      caption: p.caption,
      createdAt: p.createdAt,
      author: p.author,
      likesCount: p._count?.likes ?? 0,
      commentsCount: p._count?.comments ?? 0,
      likedByCurrentUser: (p.likes && p.likes.length > 0) || false
    }));

    return res.json({ meta: { page, limit, total }, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
