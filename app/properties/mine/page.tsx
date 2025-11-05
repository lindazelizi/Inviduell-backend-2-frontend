"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/user";
import { getJson, sendJson } from "@/lib/http-client";

type Guest = { name: string | null; email: string };
type Booking = { id: string; property_id: string; check_in: string; check_out: string; guest?: Guest | null };
type PropertyItem = { id: string; title: string; price_per_night: number; is_active: boolean; location?: string | null; bookings: Booking[] };

function fmt(d: string) {
  try {
    return new Date(d).toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

export default function MyPropertiesPage() {
  const { user, isLoading } = useUser();
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user || user.role !== "host") return;
    setLoading(true);
    setErr(null);
    try {
      const r = await getJson<{ data: PropertyItem[] }>("/properties/mine-with-bookings");
      setItems(r.data);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load().catch(() => void 0);
  }, [load]);

  async function handleDelete(id: string) {
    const p = items.find((x) => x.id === id);
    const name = p?.title ?? "annons";
    if (!confirm(`Ta bort "${name}"?\nDetta går inte att ångra.`)) return;

    setDeletingId(id);
    const prev = items;
    setItems((cur) => cur.filter((x) => x.id !== id));
    setErr(null);

    try {
      await sendJson(`/properties/${id}`, "DELETE");
    } catch (e) {
      setItems(prev);
      setErr((e as Error).message || "Kunde inte ta bort.");
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="container-safe">
        <div className="mt-8">Laddar…</div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container-safe space-y-3 mt-8">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <p>Du måste vara inloggad.</p>
        <div className="flex gap-2">
          <Link href="/login" className="rounded bg-black px-3 py-1 text-white">Logga in</Link>
          <Link href="/register" className="rounded border px-3 py-1">Skapa konto</Link>
        </div>
      </main>
    );
  }

  if (user.role !== "host") {
    return (
      <main className="container-safe space-y-3 mt-8">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <p>Endast värdar kan se och hantera egna annonser.</p>
        <Link href="/" className="underline">Till startsidan</Link>
      </main>
    );
  }

  return (
    <main className="container-safe space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mina annonser</h1>
        <Link href="/properties/new" className="rounded border px-3 py-1">+ Ny annons</Link>
      </div>

      {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

      {loading ? (
        <div>Laddar dina annonser…</div>
      ) : items.length === 0 ? (
        <div className="rounded border p-4 bg-gray-50">
          <p className="mb-2">Du har inga annonser ännu.</p>
          <Link href="/properties/new" className="underline">Skapa din första annons</Link>.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {items.map((p) => (
            <li key={p.id} className="card-like p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-lg">{p.title}</div>
                  <div className="text-sm text-zinc-600">{p.location ?? "Okänd plats"} · {p.price_per_night} kr / natt</div>
                  <div className="text-xs mt-1">Status: {p.is_active ? "Aktiv" : "Inaktiv"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/properties/${p.id}`} className="rounded-lg px-3 py-1.5 text-sm bg-black text-white hover:opacity-90">Visa</Link>
                  <Link href={`/properties/${p.id}/edit`} className="rounded-lg px-3 py-1.5 text-sm border hover:bg-gray-50">Redigera</Link>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="rounded-lg px-3 py-1.5 text-sm border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                    title="Ta bort annonsen permanent"
                  >
                    {deletingId === p.id ? "Tar bort…" : "Ta bort"}
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-sm font-medium mb-1">Bokningar</div>
                {p.bookings.length === 0 ? (
                  <div className="text-sm text-zinc-600">Inga bokningar ännu.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {p.bookings.map((b) => {
                      const who = (b.guest?.name && b.guest.name.trim()) || b.guest?.email || "Okänd gäst";
                      return (
                        <div key={b.id} className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs" title={who}>
                          <span className="font-medium">{who}</span>
                          <span className="text-zinc-500">{fmt(b.check_in)} – {fmt(b.check_out)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}