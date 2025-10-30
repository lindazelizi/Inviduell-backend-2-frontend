"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";

type NewProperty = {
  title: string;
  description?: string;
  location?: string;
  price_per_night: number;
  is_active: boolean;
};

export default function NewPropertyPage() {
  const router = useRouter();

  const [form, setForm] = React.useState<NewProperty>({
    title: "",
    description: "",
    location: "",
    price_per_night: 0,
    is_active: true,
  });

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onChange =
    (key: keyof NewProperty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.target.type === "number" ? Number(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [key]: v as any }));
    };

  const onToggleActive = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, is_active: e.target.checked }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/properties`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // viktiga cookies följer med
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description?.trim() || null,
            location: form.location?.trim() || null,
            price_per_night: Number(form.price_per_night),
            is_active: form.is_active,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || "Något gick fel vid skapande.");
        setSubmitting(false);
        return;
      }

      // Tillbaka till listan
      router.replace("/properties");
      router.refresh();
    } catch (err) {
      setError((err as Error).message ?? "Tekniskt fel.");
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <main className="p-6 max-w-2xl mx-auto">
        <a
  href="/properties/new"
  className="inline-block mb-4 underline text-blue-600 hover:text-blue-800"
>
  + Ny property
</a>
        <h1 className="text-2xl font-bold mb-6">Ny property</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium">Titel *</label>
            <input
              className="border rounded px-3 py-2"
              required
              minLength={2}
              value={form.title}
              onChange={onChange("title")}
              placeholder="Ex: Modern lägenhet nära vattnet"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Beskrivning</label>
            <textarea
              className="border rounded px-3 py-2 min-h-[100px]"
              value={form.description}
              onChange={onChange("description")}
              placeholder="Kort beskrivning…"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Plats</label>
            <input
              className="border rounded px-3 py-2"
              value={form.location ?? ""}
              onChange={onChange("location")}
              placeholder="Ex: Stockholm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">Pris per natt (kr) *</label>
            <input
              type="number"
              min={0}
              step="1"
              className="border rounded px-3 py-2"
              required
              value={form.price_per_night}
              onChange={onChange("price_per_night")}
            />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={onToggleActive} />
            <span>Aktiv listing</span>
          </label>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
            >
              {submitting ? "Sparar…" : "Skapa"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/properties")}
              className="px-4 py-2 rounded border"
            >
              Avbryt
            </button>
          </div>
        </form>
      </main>
    </PageWrapper>
  );
}