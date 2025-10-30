"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { sendJson } from "@/lib/http";

export default function NewPropertyPage() {
  const router = useRouter();

  const [title, setTitle] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [price, setPrice] = React.useState<number>(0);
  const [isActive, setIsActive] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendJson("/properties", "POST", {
        title,
        location: location || null,
        price_per_night: price,
        is_active: isActive,
      });
      router.push("/properties");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ny property</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Titel"
               value={title} onChange={e => setTitle(e.target.value)} required />

        <input className="border p-2 w-full" placeholder="Plats"
               value={location} onChange={e => setLocation(e.target.value)} />

        <input className="border p-2 w-full" type="number" min={0}
               placeholder="Pris per natt"
               value={price} onChange={e => setPrice(Number(e.target.value))} />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive}
                 onChange={e => setIsActive(e.target.checked)} />
          Aktiv
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <button disabled={loading} className="border rounded px-3 py-1">
          {loading ? "Sparar..." : "Spara"}
        </button>
      </form>
    </div>
  );
}