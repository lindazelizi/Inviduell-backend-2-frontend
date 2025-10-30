"use client";
import { createContext, useContext, useEffect, useState } from "react";

type User = { id: string; email?: string | null };

type Ctx = { user: User | null; loading: boolean; error: string | null };
const Ctx = createContext<Ctx>({ user: null, loading: true, error: null });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/auth/me`;
    fetch(url, { credentials: "include" })
      .then(async (r) => (r.ok ? r.json() : null))
      .then((u) => setUser(u))
      .catch((e) => setError(e?.message ?? "Något gick fel"))
      .finally(() => setLoading(false));
  }, []);

  return <Ctx.Provider value={{ user, loading, error }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}