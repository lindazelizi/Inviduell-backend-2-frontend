"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getJson, sendJson } from "@/lib/http-client";
import { useUser } from "@/contexts/user";

type Property = { id: string; title: string; price_per_night: number };
type BookedRange = { check_in: string; check_out: string };

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  const d1 = new Date(a);
  const d2 = new Date(b);
  const ms = d2.getTime() - d1.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  return as < be && ae > bs;
}

export default function NewBookingPage() {
  const { user, isLoading } = useUser();
  const [props, setProps] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [booked, setBooked] = useState<BookedRange[]>([]);
  const [loadingRanges, setLoadingRanges] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [preselected, setPreselected] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQuery = useMemo(() => {
    const q = searchParams.toString();
    return q ? `?${q}` : "";
  }, [searchParams]);

  useEffect(() => {
    getJson<{ data: Property[] }>("/properties")
      .then((r) => setProps(r.data))
      .catch((e) => setErr((e as Error).message));
  }, []);

  useEffect(() => {
    const today = toISODate(new Date());
    const tomorrow = toISODate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setCheckIn((d) => d || today);
    setCheckOut((d) => d || tomorrow);
  }, []);

  useEffect(() => {
    const fromSnake = searchParams.get("property_id") ?? "";
    const fromCamel = searchParams.get("propertyId") ?? "";
    const pre = fromSnake || fromCamel;
    if (pre) {
      setPropertyId(pre);
      setPreselected(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!propertyId) {
      setBooked([]);
      return;
    }
    setLoadingRanges(true);
    getJson<{ data: BookedRange[] }>(`/properties/${propertyId}/booked-ranges`)
      .then((r) => setBooked(r.data || []))
      .catch(() => setBooked([]))
      .finally(() => setLoadingRanges(false));
  }, [propertyId]);

  useEffect(() => {
    if (!checkIn || !checkOut || booked.length === 0) return;
    const hit = booked.find((br) => overlaps(checkIn, checkOut, br.check_in, br.check_out));
    if (hit) {
      const nextStart = toISODate(new Date(new Date(hit.check_out).getTime()));
      const minOut = toISODate(new Date(new Date(nextStart).getTime() + 24 * 60 * 60 * 1000));
      setCheckIn(nextStart);
      if (new Date(checkOut) <= new Date(nextStart)) setCheckOut(minOut);
    }
  }, [checkIn, checkOut, booked]);

  const selected = props.find((p) => p.id === propertyId) || null;
  const nights = checkIn && checkOut ? Math.max(0, daysBetween(checkIn, checkOut)) : 0;
  const total = selected ? nights * selected.price_per_night : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!user) {
      const next = `/booking/new${currentQuery}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (!propertyId) {
      setErr("Välj ett boende först.");
      return;
    }
    if (nights <= 0) {
      setErr("Check-out måste vara efter check-in.");
      return;
    }
    const conflict = booked.some((br) => overlaps(checkIn, checkOut, br.check_in, br.check_out));
    if (conflict) {
      setErr("Datumen krockar med en annan bokning. Välj andra datum.");
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
      const raw = (e as Error).message || "";
      if (raw.includes("no_overlap_per_property") || raw.toLowerCase().includes("overlap")) {
        setErr("Datumen krockar med en annan bokning. Välj andra datum.");
      } else if (raw.startsWith("401")) {
        setErr("Du måste vara inloggad för att skapa en bokning.");
      } else {
        setErr(raw || "Kunde inte skapa bokningen.");
      }
    }
  }

  const formDisabled = !user || isLoading;
  const today = toISODate(new Date());

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ny bokning</h1>

      {!isLoading && !user && (
        <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Du måste vara inloggad för att boka.
          <div className="mt-2 flex gap-2">
            <Link href={`/login?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`} className="rounded bg-black px-3 py-1 text-white">Logga in</Link>
            <Link href={`/register?next=${encodeURIComponent(`/booking/new${currentQuery}`)}`} className="rounded border px-3 py-1">Skapa konto</Link>
          </div>
        </div>
      )}

      {err && <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

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
            Förifyllt från detaljsidan. <Link className="underline" href={`/properties/${selected.id}`}>Ändra boende</Link>.
          </p>
        )}

        {propertyId && (
          <div className="rounded border p-3 bg-gray-50 text-xs text-gray-700">
            <div className="mb-1 font-semibold">{loadingRanges ? "Hämtar bokade datum…" : "Spärrade datum:"}</div>
            {!loadingRanges && (
              <>
                {booked.length === 0 ? (
                  <div>Inga spärrade datum just nu.</div>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {booked.map((br, i) => (
                      <li key={i}>{br.check_in} → {br.check_out}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-2 opacity-70">Du kan inte välja datum som överlappar intervallen ovan.</div>
              </>
            )}
          </div>
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

        {selected && nights > 0 && (
          <div className="rounded border p-3 text-sm bg-gray-50">
            {nights} natt{nights > 1 ? "er" : ""} × {selected.price_per_night} kr = <span className="font-semibold">{total} kr</span>
          </div>
        )}

        <button type="submit" className="rounded bg-black px-4 py-2 text-white disabled:opacity-50" disabled={formDisabled}>
          Skapa bokning
        </button>
      </form>
    </main>
  );
}