"use client";

import { useUser } from "@/contexts/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  if (isLoading) return <div className="p-6">Laddar…</div>;
  return <div className="max-w-3xl mx-auto p-6">{children}</div>;
}