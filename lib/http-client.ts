"use client";

import { supabase } from "./supabase-client";

const BASE = (process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5177").replace(/\/+$/, "");

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseOrText(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function raise(res: Response, data: unknown): never {
  const msg =
    typeof data === "string" ? data : (data as any)?.error || (data as any)?.message;
  const err: any = new Error(msg || `${res.status} ${res.statusText}`);
  err.status = res.status;
  throw err;
}

export async function getJson<T>(path: string, init: RequestInit = {}) {
  const headers = {
    Accept: "application/json",
    ...(await authHeader()),
    ...(init.headers || {}),
  } as Record<string, string>;

  const res = await fetch(`${BASE}${path}`, {
    method: "GET",
    credentials: "include",
    headers,
    ...init,
  });

  if (!res.ok) {
    const data = await parseOrText(res);
    raise(res, data);
  }

  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init: RequestInit = {}
) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(await authHeader()),
    ...(init.headers || {}),
  } as Record<string, string>;

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  });

  const data = await parseOrText(res);
  if (!res.ok) raise(res, data);
  return data as T;
}