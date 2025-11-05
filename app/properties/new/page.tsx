"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import PageWrapper from "@/components/PageWrapper";
import { useUser } from "@/contexts/user";
import { sendJson } from "@/lib/http-client";

type NewPropertyBase = {
  title: string;
  description?: string;
  location?: string;
  price_per_night: number;
  is_active: boolean;
};

type NewPropertyPayload = NewPropertyBase & {
  main_image_url: string | null;
  image_urls: string[];
};

export default function NewPropertyPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") || "/properties/new";

  const { user, isLoading } = useUser();

  // ——— all hooks först ———
  const [form, setForm] = React.useState<NewPropertyBase>({
    title: "",
    description: "",
    location: "",
    price_per_night: 0,
    is_active: true,
  });
  const [mainFile, setMainFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<FileList | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // ——— Upload via BACKEND-PROXY (multipart) ———
  async function uploadViaBackend(file: File, subfolder: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", subfolder);

    const res = await fetch("http://localhost:5177/storage/upload", {
      method: "POST",
      credentials: "include", // skicka cookies till backend
      body: fd,
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || `Upload failed (${res.status})`);
    }

    const { path } = (await res.json()) as { path: string };
    return path; // spara stigen i DB
  }

  // ——— Submit ———
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const slug =
        form.title.trim().replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "item";
      const subfolder = `props/${slug}`;

      let mainPath: string | null = null;
      if (mainFile) {
        mainPath = await uploadViaBackend(mainFile, subfolder);
      }

      const galleryPaths: string[] = [];
      if (galleryFiles && galleryFiles.length > 0) {
        for (const f of Array.from(galleryFiles)) {
          const p = await uploadViaBackend(f, subfolder);
          galleryPaths.push(p);
        }
      }

      const payload: NewPropertyPayload = {
        ...form,
        main_image_url: mainPath,
        image_urls: galleryPaths,
      };

      await sendJson<{ data: any }>("/properties", "POST", payload);
      router.push("/properties?created=1");
    } catch (err: any) {
      setError(err?.message ?? "Något gick fel");
      setSaving(false);
    }
  }

  // ——— gate efter hooks ———
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
        <h1 className="text-2xl font-bold mb-2">Ny property</h1>
        <p className="mb-3">Du måste vara inloggad för att skapa en annons.</p>
        <div className="flex gap-2">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="rounded bg-black px-3 py-1 text-white"
          >
            Logga in
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="rounded border px-3 py-1"
          >
            Skapa konto
          </Link>
        </div>
      </PageWrapper>
    );
  }

  if (user.role !== "host") {
    return (
      <PageWrapper>
        <h1 className="text-2xl font-bold mb-2">Ny property</h1>
        <p>
          Endast <b>värdar</b> kan skapa annonser.
        </p>
        <Link href="/properties" className="underline mt-2 inline-block">
          Tillbaka till listan
        </Link>
      </PageWrapper>
    );
  }

  // ——— UI ———
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Ny property</h1>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

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
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Plats</label>
          <input
            className="w-full border rounded p-2"
            value={form.location ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Pris per natt (kr)</label>
          <input
            type="number"
            className="w-full border rounded p-2"
            value={form.price_per_night}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                price_per_night: Number(e.target.value),
              }))
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

        <div>
          <label className="block text-sm mb-1">Huvudbild (fil)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setMainFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Galleri (flera filer)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setGalleryFiles(e.target.files)}
          />
          <p className="text-xs text-gray-600 mt-1">
            Du kan välja flera bilder samtidigt.
          </p>
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