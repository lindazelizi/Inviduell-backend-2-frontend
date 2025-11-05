"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/contexts/user";
import LogoutButton from "./LogoutButton";

export default function AppHeader() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();

  const displayName =
    (user?.name && user.name.trim()) ||
    (user?.email ? user.email.split("@")[0] : "");

  const isActive = (p: string) =>
    pathname?.startsWith(p) ? "underline" : "";

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4">
          {/* Alltid synlig: hem */}
          <Link href="/">Bnb</Link>

          {/* Endast värdar ser "Mina properties" */}
          {!isLoading && user?.role === "host" && (
            <Link href="/properties/mine" className={isActive("/properties/mine")}>
              Mina properties
            </Link>
          )}

          {/* Endast hyresgäster ser "Mina bokningar" */}
          {!isLoading && user?.role === "guest" && (
            <Link href="/booking" className={isActive("/booking")}>
              Mina bokningar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <span className="text-sm text-gray-700">Hej {displayName}!</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm underline">
                Logga in
              </Link>
              <Link
                href="/register"
                className="rounded bg-black px-2 py-1 text-sm text-white"
              >
                Skapa konto
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}