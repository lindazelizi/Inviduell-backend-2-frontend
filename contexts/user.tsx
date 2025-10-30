"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getJson } from "@/lib/http";

type User = { id: string; email: string };
type Ctx = { user: User | null; isLoading: boolean };

const UserCtx = createContext<Ctx>({ user: null, isLoading: true });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await getJson<User>("/auth/me");
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <UserCtx.Provider value={{ user, isLoading }}>
      {children}
    </UserCtx.Provider>
  );
}

export const useUser = () => useContext(UserCtx);