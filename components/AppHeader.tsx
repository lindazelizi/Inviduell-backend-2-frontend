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
    pathname?.startsWith(p) ? "text-black" : "text-neutral-600 hover:text-black";

  return (
    <header className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold">Bnb</Link>
          {!isLoading && user?.role === "host" && (
            <Link href="/properties/mine" className={`text-sm ${isActive("/properties/mine")}`}>
              Mina properties
            </Link>
          )}
          {!isLoading && user?.role === "guest" && (
            <Link href="/booking" className={`text-sm ${isActive("/booking")}`}>
              Mina bokningar
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <span className="hidden text-sm text-neutral-700 sm:inline">
                Hej {displayName}!
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm underline">Logga in</Link>
              <Link href="/register" className="rounded-xl bg-black px-3 py-1 text-sm text-white">
                Skapa konto
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}