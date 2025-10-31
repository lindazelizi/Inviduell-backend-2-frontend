import { cookies } from "next/headers";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL!;

/**
 * Server-fetch helper: plockar ut cookie-headern på serversidan
 * och skickar den vidare till backend.
 */
async function withCookie(init: RequestInit = {}): Promise<RequestInit> {
  const h = new Headers(init.headers as HeadersInit);

  try {
    // Next 15/16: cookies() är asynkront – använd await och toString()
    const cookie = (await cookies()).toString();
    if (cookie) h.set("cookie", cookie);
  } catch {
    // om vi (mot förmodan) hamnar i klientsammanhang, gör inget
  }

  return {
    ...init,
    headers: h,
    credentials: "include", // viktigt för att behålla session
    cache: "no-store",      // per-request (ingen cache som kan “tappa” cookies)
  };
}

export async function getJson<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, await withCookie({ method: "GET", ...init }));
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init: RequestInit = {}
) {
  const res = await fetch(`${BASE}${path}`, await withCookie({
    method,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...init,
  }));
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}