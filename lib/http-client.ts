"use client";

import { supabase } from "./supabase-client";

const BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:5177";

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
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

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function sendJson<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
  init: RequestInit = {}
) {
  const headers = {
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

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || `${res.status} ${res.statusText}`);
  return data as T;
}