import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL!;

async function withCookie(init: RequestInit = {}): Promise<RequestInit> {
  const h = new Headers(init.headers as HeadersInit);
  try {
    const jar = await cookies();
    const cookie = jar.toString();
    if (cookie) h.set("cookie", cookie);
  } catch {}
  return {
    ...init,
    headers: h,
    credentials: "include",
    cache: "no-store",
  };
}

async function parseOrText(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function getJson<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, await withCookie({ method: "GET", ...init }));
  if (!res.ok) {
    const data = await parseOrText(res);
    const msg = typeof data === "string" ? data : (data as any)?.error || (data as any)?.message;
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init: RequestInit = {}
) {
  const res = await fetch(
    `${BASE}${path}`,
    await withCookie({
      method,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...init,
    })
  );
  const data = await parseOrText(res);
  if (!res.ok) {
    const msg = typeof data === "string" ? data : (data as any)?.error || (data as any)?.message;
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  return data as T;
}