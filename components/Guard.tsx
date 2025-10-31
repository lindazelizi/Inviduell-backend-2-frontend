"use client";

import { useUser } from "@/contexts/user";
import Link from "next/link";

export default function Guard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Laddar…</div>;

  if (!user) {
    return (
      <div className="border rounded p-4 bg-yellow-50">
        <p className="mb-2">Du måste vara inloggad för att se den här sidan.</p>
        <Link className="underline" href="/login">Gå till login</Link>
      </div>
    );
  }

  return <>{children}</>;
}