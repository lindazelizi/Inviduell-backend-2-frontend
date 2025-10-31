"use client";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL!;

export async function getJson<T>(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    credentials: "include",
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init: RequestInit = {}
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error ?? `${res.status} ${res.statusText}`);
  return data as T;
}