import { useEffect, useState } from "react";
import { getJson, postJson } from "../utils/api";
import Link from "next/link";

type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  author: { id: string; username: string; avatarUrl?: string };
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await getJson("/feed?page=1&limit=20");
    setPosts(res?.data || []);
    setLoading(false);
  }

  async function toggleLike(id: string, liked: boolean) {
    if (liked) {
      await fetch(`/api/posts/${id}/like`, { method: "DELETE", credentials: "include" });
    } else {
      await fetch(`/api/posts/${id}/like`, { method: "POST", credentials: "include" });
    }
    await load();
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>Insta Mini</h1>
        <div>
          <Link href="/create">Create</Link> | <Link href="/login">Login</Link> | <Link href="/signup">Signup</Link>
        </div>
      </header>

      <main>
        {loading ? (
          <p>Loading...</p>
        ) : posts.length === 0 ? (
          <p>No posts in your feed yet.</p>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="card">
              <div className="post-header">
                <strong>{p.author.username}</strong>
              </div>
              <img src={p.imageUrl} alt={p.caption} className="post-image" />
              <p>{p.caption}</p>
              <div className="post-actions">
                <button onClick={() => toggleLike(p.id, p.likedByCurrentUser)}>
                  {p.likedByCurrentUser ? "Unlike" : "Like"} ({p.likesCount})
                </button>
                <Link href={`/post/${p.id}`}>Comments ({p.commentsCount})</Link>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  );
}
