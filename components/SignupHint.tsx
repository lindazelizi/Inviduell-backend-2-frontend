"use client";

import Link from "next/link";
import { useUser } from "@/contexts/user";

export default function SignupHint({ className = "" }: { className?: string }) {
  const { user, isLoading } = useUser();
  if (isLoading || user) return null;

  return (
    <div className={`mt-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 ${className}`}>
      Ny här? Skapa ett konto för att kunna boka snabbare och se dina bokningar.
      <div className="mt-2 flex gap-2">
        <Link href="/register" className="rounded bg-black px-3 py-1 text-white">Skapa konto</Link>
        <Link href="/login" className="rounded border px-3 py-1">Logga in</Link>
      </div>
    </div>
  );
}