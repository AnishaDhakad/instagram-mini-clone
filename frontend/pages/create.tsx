import { useState } from "react";
import { postJson } from "../utils/api";
import { useRouter } from "next/router";

export default function CreatePage() {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError("");
    const res = await postJson("/posts", { imageUrl, caption });
    if (res?.post) {
      router.push("/");
    } else {
      setError(res?.message || "Failed");
    }
  }

  return (
    <div className="container">
      <h1>Create Post</h1>
      <form onSubmit={submit} className="card">
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" />
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption" />
        <button type="submit">Post</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
