"use client";

import { useUser } from "@/contexts/user";

export default function Greeting() {
  const { user } = useUser();

  if (!user) return null;

  const display =
    // om du senare lägger till namn
    (user as any).name?.trim?.() ||
    // annars visa delen före @ i e-posten
    user.email?.split("@")[0] ||
    "där";

  return (
    <p className="text-lg mb-2">
      Hej <span className="font-semibold">{display}</span> 👋
    </p>
  );
}