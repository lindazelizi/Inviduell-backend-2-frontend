"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/contexts/user";
import { getJson } from "@/lib/http-client";

type Booking = {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  created_at: string;
};

type Property = {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
};

type UIBooking = Booking & {
  _title: string;
  _location: string;
  _nights: number;
};

function daysBetween(a: string, b: string) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

function fmtDate(d: string) {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtSek(n: number) {
  try {
    return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${n} kr`;
  }
}

export default function BookingsPage() {
  const { user, isLoading } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [propsMap, setPropsMap] = useState<Record<string, Property>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoadingList(true);
      setError(null);
      try {
        const br = await getJson<{ data: Booking[] }>("/bookings");
        const bks = br.data ?? [];
        setBookings(bks);

        const pr = await getJson<{ data: Property[] }>("/properties");
        const map: Record<string, Property> = {};
        for (const p of pr.data ?? []) map[p.id] = p;

        const missing = [...new Set(bks.map((b) => b.property_id).filter((pid) => !map[pid]))];
        await Promise.all(
          missing.map(async (pid) => {
            try {
              const one = await getJson<{ data: Property }>(`/properties/${pid}`);
              map[pid] = one.data;
            } catch {}
          })
        );

        setPropsMap(map);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg.startsWith("401") ? "Du måste vara inloggad." : msg);
      } finally {
        setLoadingList(false);
      }
    }
    load();
  }, [user]);

  const withUi: UIBooking[] = useMemo(() => {
    return bookings.map((b): UIBooking => {
      const p = propsMap[b.property_id];
      return {
        ...b,
        _title: p?.title ?? "Okänt boende",
        _location: p?.location ?? "",
        _nights: daysBetween(b.check_in, b.check_out),
      };
    });
  }, [bookings, propsMap]);

  if (isLoading) {
    return (
      <PageWrapper>
        <p>Laddar…</p>
      </PageWrapper>
    );
  }

  if (!user) {
    return (
      <PageWrapper>
        <h1 className="text-2xl font-bold mb-4">Mina bokningar</h1>
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Du måste vara inloggad för att se dina bokningar.
          <div className="mt-2 flex gap-2">
            <Link href="/login?next=%2Fbooking" className="rounded bg-black px-3 py-1 text-white">Logga in</Link>
            <Link href="/register?next=%2Fbooking" className="rounded border px-3 py-1">Skapa konto</Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mina bokningar</h1>
        <Link href="/booking/new" className="border rounded px-3 py-1">+ Ny bokning</Link>
      </div>

      {error && <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      {loadingList ? (
        <p className="mt-4">Laddar bokningar…</p>
      ) : withUi.length === 0 ? (
        <div className="mt-4 rounded border p-4 bg-gray-50">
          <p className="mb-2">Du har inga bokningar ännu.</p>
          <Link href="/booking/new" className="underline">Skapa din första bokning</Link>.
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-1 gap-3">
          {withUi.map((b) => (
            <li key={b.id} className="rounded-2xl border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-lg truncate">{b._title}</div>
                  {b._location ? <div className="text-sm text-gray-600 truncate">{b._location}</div> : null}
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 text-xs px-2 py-1 border border-emerald-200">Bokad</span>
              </div>

              <div className="mt-3 text-sm">
                <div>
                  <span className="font-medium">{fmtDate(b.check_in)}</span> — <span className="font-medium">{fmtDate(b.check_out)}</span>
                  {b._nights > 0 && <span className="text-gray-500"> · {b._nights} natt{b._nights > 1 ? "er" : ""}</span>}
                </div>
                <div className="mt-1">Totalt: <span className="font-semibold">{fmtSek(b.total_price)}</span></div>
                <div className="mt-1 text-xs text-gray-500">Bokad {fmtDate(b.created_at.slice(0, 10))}</div>
              </div>

              <div className="mt-3 flex gap-2 text-sm">
                <Link href={`/properties/${b.property_id}`} className="rounded border px-3 py-1 hover:bg-gray-50">Visa boende</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}