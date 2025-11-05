"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getJson, sendJson } from "@/lib/http-client";
import { useUser } from "@/contexts/user";

type Property = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
  main_image_url: string | null;
  image_urls: string[];
  owner_id: string;
};

type FormState = {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  is_active: boolean;
  main_image_url: string;
  image_urls: string | string[];
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    location: "",
    price_per_night: 0,
    is_active: true,
    main_image_url: "",
    image_urls: "",
  });

  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    getJson<{ data: Property }>(`/properties/${id}`)
      .then((r) => {
        const p = r.data;
        setForm({
          title: p.title,
          description: p.description ?? "",
          location: p.location ?? "",
          price_per_night: p.price_per_night,
          is_active: p.is_active,
          main_image_url: p.main_image_url ?? "",
          image_urls: Array.isArray(p.image_urls) ? p.image_urls.join(", ") : "",
        });
      })
      .catch((e) => setErr((e as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  const forbid = useMemo(() => {
    if (isLoading) return false;
    return !user || user.role !== "host";
  }, [user, isLoading]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setErr(null);

    const imgs =
      typeof form.image_urls === "string"
        ? form.image_urls.split(",").map((s) => s.trim()).filter(Boolean)
        : form.image_urls;

    try {
      await sendJson<{ data: Property }>(`/properties/${id}`, "PATCH", {
        title: form.title,
        description: form.description || null,
        location: form.location || null,
        price_per_night: Number(form.price_per_night ?? 0),
        is_active: Boolean(form.is_active),
        main_image_url: form.main_image_url || null,
        image_urls: imgs,
      });
      router.push("/properties/mine");
    } catch (e: any) {
      setErr(e?.message || "Kunde inte spara.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || loading) {
    return (
      <main className="container-safe mt-8">
        <p>Laddar…</p>
      </main>
    );
  }

  if (forbid) {
    return (
      <main className="container-safe mt-8 space-y-3">
        <h1 className="text-2xl font-bold">Redigera annons</h1>
        <p>Endast värdar kan redigera annonser.</p>
        <Link className="underline" href="/">Till startsidan</Link>
      </main>
    );
  }

  return (
    <main className="container-safe max-w-3xl mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Redigera annons</h1>
        <Link href="/properties/mine" className="rounded border px-3 py-1">← Till mina annonser</Link>
      </div>

      {err && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{err}</div>}

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titel</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
        </div>

        <div>
          <label className="block text-sm font-medium">Plats</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.location} onChange={(e) => setForm((s) => ({ ...s, location: e.target.value }))} />
        </div>

        <div>
          <label className="block text-sm font-medium">Pris per natt (kr)</label>
          <input type="number" min={0} className="mt-1 w-full rounded border px-3 py-2" value={form.price_per_night} onChange={(e) => setForm((s) => ({ ...s, price_per_night: Number(e.target.value || 0) }))} required />
        </div>

        <div className="flex items-center gap-2">
          <input id="active" type="checkbox" className="h-4 w-4" checked={!!form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))} />
          <label htmlFor="active" className="text-sm">Aktiv annons (bokningsbar)</label>
        </div>

        <div>
          <label className="block text-sm font-medium">Huvudbild (storage-stig eller URL)</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={form.main_image_url} onChange={(e) => setForm((s) => ({ ...s, main_image_url: e.target.value }))} placeholder="t.ex. city/apt-1/hero.jpg" />
        </div>

        <div>
          <label className="block text-sm font-medium">Galleri (komma-separerade storage-stigar eller URL:er)</label>
          <textarea className="mt-1 w-full rounded border px-3 py-2" rows={3} value={typeof form.image_urls === "string" ? form.image_urls : form.image_urls.join(", ")} onChange={(e) => setForm((s) => ({ ...s, image_urls: e.target.value }))} placeholder="t.ex. city/apt-1/1.jpg, city/apt-1/2.jpg" />
        </div>

        <div>
          <label className="block text-sm font-medium">Beskrivning</label>
          <textarea className="mt-1 w-full rounded border px-3 py-2" rows={5} value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} />
        </div>

        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={saving} className="rounded bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50">
            {saving ? "Sparar…" : "Spara"}
          </button>
          <button type="button" className="rounded border px-4 py-2" onClick={() => router.back()}>
            Avbryt
          </button>
        </div>
      </form>
    </main>
  );
}