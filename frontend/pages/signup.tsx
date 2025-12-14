import { useState } from "react";
import { postJson } from "../utils/api";
import { useRouter } from "next/router";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError("");
    const res = await postJson("/auth/signup", { username, email, password });
    if (res?.user) {
      router.push("/");
    } else {
      setError(res?.message || "Signup failed");
    }
  }

  return (
    <div className="container">
      <h1>Signup</h1>
      <form onSubmit={submit} className="card">
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
        <button type="submit">Signup</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
