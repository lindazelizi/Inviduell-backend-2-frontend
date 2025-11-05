"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getJson, sendJson } from "@/lib/http-client";

export type User = {
  id: string;
  email: string;
  name: string | null;
  role: "guest" | "host";
} | null;

type Ctx = {
  user: User;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const UserContext = createContext<Ctx | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await getJson<{ id: string; email: string; name: string | null; role: "guest" | "host" }>("/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    await sendJson("/auth/login", "POST", { email, password });
    await refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await sendJson("/auth/logout", "POST");
    setUser(null);
    setIsLoading(false);
    setTimeout(() => { refresh().catch(() => void 0); }, 0);
  }, [refresh]);

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, refresh }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}