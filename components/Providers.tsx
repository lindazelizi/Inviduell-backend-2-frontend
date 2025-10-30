"use client";

import { UserProvider } from "@/contexts/user";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}