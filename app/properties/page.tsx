"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user";

export default function PropertiesRedirectPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "host") {
      router.replace("/properties/mine");
      return;
    }
    if (user.role === "guest") {
      router.replace("/booking");
      return;
    }
    router.replace("/login");
  }, [user, isLoading, router]);

  return <div className="app-container py-10 text-center text-neutral-600">Omdirigerar…</div>;
}