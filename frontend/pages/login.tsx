import { useState } from "react";
import { postJson } from "../utils/api";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError("");
    const res = await postJson("/auth/login", { emailOrUsername, password });
    if (res?.user) {
      router.push("/");
    } else {
      setError(res?.message || "Login failed");
    }
  }

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={submit} className="card">
        <input value={emailOrUsername} onChange={(e) => setEmailOrUsername(e.target.value)} placeholder="email or username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="password" />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
