"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import { sendJson } from "@/lib/http-client";

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
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await sendJson<{ data: any }>("/properties", "POST", form);
      router.push("/properties?created=1");
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel");
      setSaving(false);
    }
  }

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Ny property</h1>

      {error ? (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm mb-1">Titel</label>
          <input
            className="w-full border rounded p-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Beskrivning</label>
          <textarea
            className="w-full border rounded p-2"
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Plats</label>
          <input
            className="w-full border rounded p-2"
            value={form.location ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Pris per natt (kr)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={form.price_per_night}
            onChange={(e) =>
              setForm((f) => ({ ...f, price_per_night: Number(e.target.value) }))
            }
            min={0}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
          />
          <label htmlFor="is_active">Aktiv</label>
        </div>

        <button
          disabled={saving}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Sparar…" : "Spara"}
        </button>
      </form>
    </PageWrapper>
  );
}