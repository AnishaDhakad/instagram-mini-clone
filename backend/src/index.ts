import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import usersRoutes from "./routes/users";
import feedRoutes from "./routes/feed";
import postsRoutes from "./routes/posts";
import likesRoutes from "./routes/likes";
import commentsRoutes from "./routes/comments";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
  })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api", likesRoutes);
app.use("/api", commentsRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
