const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function postJson(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include"
  });
  return res.json();
}

export async function getJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  return res.json();
}

export async function deleteJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { method: "DELETE", credentials: "include" });
  return res.json();
}
