import express from "express";
import { prisma } from "../prisma";
import { authMiddleware, AuthRequest } from "../middlewares/auth";

const router = express.Router();

/**
 * GET /api/users/:username
 * Public profile summary
 */
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, name: true, bio: true, avatarUrl: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const [followersCount, followingCount, postsCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: user.id } }),
      prisma.follow.count({ where: { followerId: user.id } }),
      prisma.post.count({ where: { authorId: user.id } })
    ]);

    return res.json({ user, counts: { followers: followersCount, following: followingCount, posts: postsCount } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * POST /api/users/:username/follow
 * Follow a user (auth required)
 */
router.post("/:username/follow", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const followerId = req.user.id;
    const { username } = req.params;

    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) return res.status(404).json({ message: "User to follow not found" });
    if (target.id === followerId) return res.status(400).json({ message: "Cannot follow yourself" });

    const existing = await prisma.follow.findFirst({ where: { followerId, followingId: target.id } });
    if (existing) return res.status(409).json({ message: "Already following this user" });

    await prisma.follow.create({ data: { followerId, followingId: target.id } });

    const followersCount = await prisma.follow.count({ where: { followingId: target.id } });
    return res.status(201).json({ ok: true, followersCount });
  } catch (err: any) {
    if (err?.code === "P2002") return res.status(409).json({ message: "Already following this user" });
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * DELETE /api/users/:username/follow
 * Unfollow a user (auth required)
 */
router.delete("/:username/follow", authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const followerId = req.user.id;
    const { username } = req.params;

    const target = await prisma.user.findUnique({ where: { username } });
    if (!target) return res.status(404).json({ message: "User to unfollow not found" });

    const deleted = await prisma.follow.deleteMany({ where: { followerId, followingId: target.id } });
    const followersCount = await prisma.follow.count({ where: { followingId: target.id } });

    return res.json({ ok: true, removed: deleted.count > 0, followersCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
