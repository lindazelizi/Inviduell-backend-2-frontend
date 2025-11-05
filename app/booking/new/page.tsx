"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getJson, sendJson } from "@/lib/http-client";
import { useUser } from "@/contexts/user";

type Property = { id: string; title: string; price_per_night: number };

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const ms = d2.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default function NewBookingPage() {
  const { user, isLoading } = useUser();
  const [props, setProps] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [preselected, setPreselected] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Behåll queryn för att kunna skicka med i "nästa"-länkar
  const currentQuery = useMemo(() => {
    const q = searchParams.toString();
    return q ? `?${q}` : "";
  }, [searchParams]);

  // Hämta properties till dropdown
  useEffect(() => {
    getJson<{ data: Property[] }>("/properties")
      .then((r) => setProps(r.data))
      .catch((e) => setErr((e as Error).message));
  }, []);

  // Initiera datum (i dag + i morgon)
  useEffect(() => {
    const today = toISODate(new Date());
    const tomorrow = toISODate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setCheckIn((d) => d || today);
    setCheckOut((d) => d || tomorrow);
  }, []);

  // Förvälj property om vi kom från annan sida (?property_id=... eller ?propertyId=...)
  useEffect(() => {
    const fromSnake = searchParams.get("property_id") ?? "";
    const fromCamel = searchParams.get("propertyId") ?? "";
    const pre = fromSnake || fromCamel;
    if (pre) {
      setPropertyId(pre);
      setPreselected(true);
    }
  }, [searchParams]);

  // Om användaren ändrar check-in: se till att check-out minst är dagen efter
  useEffect(() => {
    if (!checkIn || !checkOut) return;
    if (daysBetween(checkIn, checkOut) <= 0) {
      const nextDay = toISODate(new Date(new Date(checkIn).getTime() + 24 * 60 * 60 * 1000));
      setCheckOut(nextDay);
    }
  }, [checkIn]); // avsiktligt: rejustera bara när check-in ändras

  const selected = props.find((p) => p.id === propertyId) || null;
  const nights = checkIn && checkOut ? Math.max(0, daysBetween(checkIn, checkOut)) : 0;
  const total = selected ? nights * selected.price_per_night : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Om ej inloggad: skicka till login och ta med next + ev. förvalda parametrar
    if (!user) {
      const next = `/booking/new${currentQuery}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // Klientvalidering av datum
    if (!propertyId) {
      setErr("Välj ett boende först.");
      return;
    }
    if (nights <= 0) {
      setErr("Check-out måste vara efter check-in.");
      return;
    }

    try {
      await sendJson("/bookings", "POST", {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
      });
      router.push("/booking?created=1");
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.startsWith("401")) {
        setErr("Du måste vara inloggad för att skapa en booking.");
      } else {
        setErr(msg);
      }
    }
  }

  const formDisabled = !user || isLoading;
  const today = toISODate(new Date());

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ny booking</h1>

      {/* Banner om man inte är inloggad */}
      {!isLoading && !user && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Du måste vara inloggad för att boka.
          <div className="mt-2 flex gap-2">
            <Link
              href={`/login?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`}
              className="rounded bg-black px-3 py-1 text-white"
            >
              Logga in
            </Link>
            <Link
              href={`/register?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`}
              className="rounded border px-3 py-1"
            >
              Skapa konto
            </Link>
          </div>
        </div>
      )}

      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {err}{" "}
          {!user && (
            <>
              <Link
                href={`/login?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`}
                className="underline"
              >
                Logga in
              </Link>{" "}
              eller{" "}
              <Link
                href={`/register?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`}
                className="underline"
              >
                skapa konto
              </Link>
              .
            </>
          )}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <label className="text-sm">Boende</label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="border rounded px-3 py-2 w-full disabled:opacity-50"
          required
          disabled={formDisabled || preselected}
        >
          <option value="">Välj property</option>
          {props.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} · {p.price_per_night} kr/natt
            </option>
          ))}
        </select>

        {preselected && selected && (
          <p className="text-xs text-gray-600">
            Förifyllt från detaljsidan.{" "}
            <Link className="underline" href={`/properties/${selected.id}`}>
              Ändra boende
            </Link>
            .
          </p>
        )}

        <label className="text-sm">Check-in</label>
        <input
          type="date"
          value={checkIn}
          min={today}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border rounded px-3 py-2 w-full disabled:opacity-50"
          required
          disabled={formDisabled}
        />

        <label className="text-sm">Check-out</label>
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border rounded px-3 py-2 w-full disabled:opacity-50"
          required
          disabled={formDisabled}
        />

        {/* Prisöversikt */}
        {selected && nights > 0 && (
          <div className="rounded border p-3 text-sm bg-gray-50">
            {nights} natt{nights > 1 ? "er" : ""} × {selected.price_per_night} kr ={" "}
            <span className="font-semibold">{total} kr</span>
          </div>
        )}

        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={formDisabled}
        >
          Skapa booking
        </button>
      </form>
    </main>
  );
}