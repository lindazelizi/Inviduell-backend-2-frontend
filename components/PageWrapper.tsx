"use client";
import { useUser } from "@/contexts/user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <div className="p-6">Laddar…</div>;
  return <div className="max-w-3xl mx-auto p-6">{children}</div>;
}