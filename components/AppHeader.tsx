"use client";

import { useUser } from "@/contexts/user";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader() {
  const { user, isLoading } = useUser();

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto p-4 flex items-center justify-between">
        <a href="/properties" className="font-semibold">Bnb</a>
        {!isLoading && user ? <LogoutButton /> : null}
      </div>
    </header>
  );
}