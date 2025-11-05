"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/user";
import { getJson } from "@/lib/http-client";

type Property = {
  id: string;
  title: string;
  price_per_night: number;
  is_active: boolean;
  location?: string | null;
};

export default function MyPropertiesPage() {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<Property[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Ladda endast om man är host
  useEffect(() => {
    if (!user || user.role !== "host") return;
    getJson<{ data: Property[] }>("/properties/mine")
      .then((r) => setItems(r.data))
      .catch((e) => setErr((e as Error).message));
  }, [user]);

  // Laddar…
  if (isLoading) {
    return <main className="max-w-3xl mx-auto p-6">Laddar…</main>;
  }

  // Utloggad
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-3">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <p>Du måste vara inloggad.</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded bg-black px-3 py-1 text-white">Logga in</Link>
          <Link href="/register" className="rounded border px-3 py-1">Skapa konto</Link>
        </div>
      </main>
    );
  }

  // Fel roll
  if (user.role !== "host") {
    return (
      <main className="max-w-3xl mx-auto p-6 space-y-3">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <p>Endast <b>värdar</b> kan se och hantera egna annonser.</p>
        <Link href="/" className="underline">Till startsidan</Link>
      </main>
    );
  }

  // Inloggad host
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <Link
          href="/properties/new"
          className="border rounded px-3 py-1 inline-block"
        >
          + Ny property
        </Link>
      </div>

      {err && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded border p-4 bg-gray-50">
          <p className="mb-2">Du har inga annonser ännu.</p>
          <Link href="/properties/new" className="underline">
            Skapa din första annons
          </Link>
          .
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {items.map((p) => (
            <li key={p.id} className="rounded border p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">
                {p.location ?? "Okänd plats"} · {p.price_per_night} kr / natt
              </div>
              <div className="text-xs mt-1">
                Status: {p.is_active ? "Aktiv" : "Inaktiv"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}