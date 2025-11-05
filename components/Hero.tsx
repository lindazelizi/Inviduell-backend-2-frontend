"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Hero() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <section className="mb-6 rounded-3xl border bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-bold tracking-tight">Hitta ett boende</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Publik lista över aktiva boenden. Klicka för detaljer.
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Sök plats, titel…"
          className="w-full rounded-xl border px-4 py-2 outline-none ring-0 focus:border-neutral-400"
        />
        <button className="rounded-xl bg-black px-4 py-2 text-white transition hover:opacity-90" type="submit">
          Sök
        </button>
      </form>
    </section>
  );
}