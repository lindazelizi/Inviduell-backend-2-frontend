"use client";

import { useUser } from "@/contexts/user";

export default function Greeting() {
  const { user } = useUser();
  if (!user) return null;

  const display =
    (user as any).name?.trim?.() ||
    user.email?.split("@")[0] ||
    "där";

  return (
    <p className="text-lg mb-2">
      Hej <span className="font-semibold">{display}</span> 👋
    </p>
  );
}