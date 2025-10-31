"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getJson, sendJson } from "@/lib/http-client";

type Property = { id: string; title: string; price_per_night: number };

export default function NewBookingPage() {
  const [props, setProps] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Hämta properties till dropdown
  useEffect(() => {
    getJson<{ data: Property[] }>("/properties")
      .then((r) => setProps(r.data))
      .catch((e) => setErr((e as Error).message));
  }, []);

  // Förvälj property om vi kom från startsidan med ?propertyId=...
  useEffect(() => {
    const pre = searchParams.get("propertyId") ?? "";
    if (pre) setPropertyId(pre);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await sendJson("/bookings", "POST", {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
      });
      router.push("/booking?created=1");
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ny booking</h1>

      {err && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {err}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-3 max-w-sm">
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        >
          <option value="">Välj property</option>
          {props.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} · {p.price_per_night} kr/natt
            </option>
          ))}
        </select>

        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />

        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border rounded px-3 py-2 w-full"
          required
        />

        <button type="submit" className="border rounded px-3 py-2">
          Skapa booking
        </button>
      </form>
    </main>
  );
}