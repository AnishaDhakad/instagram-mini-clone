import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getJson, postJson } from "../../utils/api";

export default function PostDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (id) load();
  }, [id]);

  async function load() {
    const res = await getJson(`/posts/${id}`);
    setPost(res?.post);
    const c = await getJson(`/posts/${id}/comments`);
    setComments(c?.comments || []);
  }

  async function addComment(e: any) {
    e.preventDefault();
    await postJson(`/posts/${id}/comments`, { text });
    setText("");
    await load();
  }

  return (
    <div className="container">
      {!post ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="card">
            <h2>{post.author.username}</h2>
            <img src={post.imageUrl} className="post-image" />
            <p>{post.caption}</p>
          </div>

          <section>
            <h3>Comments</h3>
            <ul>
              {comments.map((c) => (
                <li key={c.id}>
                  <strong>{c.user.username}</strong>: {c.text}
                </li>
              ))}
            </ul>

            <form onSubmit={addComment}>
              <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment" />
              <button type="submit">Comment</button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
