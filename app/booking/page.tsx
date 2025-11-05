"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

export default function BookingsPage() {
  const { user, isLoading } = useUser();
  const sp = useSearchParams();

  const justCreated = useMemo(() => sp.get("created") === "1", [sp]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  // Hämta bokningar först när användare finns
  useEffect(() => {
    if (!user) return; // utloggad -> hämta inte
    setLoadingList(true);
    setError(null);
    getJson<{ data: Booking[] }>("/bookings")
      .then((r) => setBookings(r.data))
      .catch((e) => {
        const msg = (e as Error).message;
        setError(msg.startsWith("401") ? "Du måste vara inloggad." : msg);
      })
      .finally(() => setLoadingList(false));
  }, [user]);

  // Laddar användare
  if (isLoading) {
    return (
      <PageWrapper>
        <p>Laddar…</p>
      </PageWrapper>
    );
  }

  // Utloggad vy
  if (!user) {
    return (
      <PageWrapper>
        <h1 className="text-2xl font-bold mb-4">Mina bokningar</h1>
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Du måste vara inloggad för att se dina bokningar.
          <div className="mt-2 flex gap-2">
            <Link href="/login?next=%2Fbooking" className="rounded bg-black px-3 py-1 text-white">
              Logga in
            </Link>
            <Link href="/register?next=%2Fbooking" className="rounded border px-3 py-1">
              Skapa konto
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Inloggad vy
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Mina bokningar</h1>

      {justCreated && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Booking skapad!
        </div>
      )}

      <div className="mb-4">
        <Link href="/booking/new" className="border rounded px-3 py-1 inline-block">
          + Ny booking
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loadingList ? (
        <p>Laddar bokningar…</p>
      ) : bookings.length === 0 ? (
        <p>Du har inga bokningar ännu.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="border rounded p-3">
              <div className="font-semibold">#{b.id.slice(0, 8)}</div>
              <div className="text-sm">Property: {b.property_id}</div>
              <div className="text-sm">
                {b.check_in} → {b.check_out} · {b.total_price} kr
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}