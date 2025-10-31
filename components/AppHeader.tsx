"use client";

import Link from "next/link";
import { useUser } from "@/contexts/user";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto p-4 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Bnb</Link>

          {!isLoading && user && (
            <Link href="/booking" className="underline">
              Mina bokningar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <span className="text-sm text-gray-500">Laddar…</span>
          ) : user ? (
            <LogoutButton />
          ) : (
            <>
              <Link href="/login" className="underline">Logga in</Link>
              <Link href="/register" className="underline">Registrera</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}