"use client";

import Link from "next/link";
import { useUser } from "@/contexts/user";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto p-4 flex items-center justify-between">
        <Link href="/" prefetch={false} className="font-semibold">Bnb</Link>

        <nav className="flex items-center gap-4">
          <Link href="/properties" prefetch={false}>Properties</Link>
          {/* Skydda bokningssidan i headern */}
          {user ? (
            <Link href="/booking" prefetch={false}>Mina bokningar</Link>
          ) : null}

          {/* Auth-knappar */}
          {!isLoading && !user ? (
            <>
              <Link href="/login" prefetch={false}>Logga in</Link>
              <Link href="/register" prefetch={false}>Registrera</Link>
            </>
          ) : null}
          {!isLoading && user ? <LogoutButton /> : null}
        </nav>
      </div>
    </header>
  );
}