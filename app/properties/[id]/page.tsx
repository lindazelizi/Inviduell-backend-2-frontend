export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJson } from "@/lib/http-server";
import type { Property } from "@/types/models";

// Läs ditt Supabase-projekt-URL från env
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";

/** Gör om en ev. storage-stig till en full publik URL för bucket "properties". */
function toPublicUrl(p?: string | null): string {
  if (!p) return "/file.svg"; // fallback
  // Redan en absolut URL (http/https) eller en lokal /-path? Använd som den är.
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/")) {
    return p;
  }
  // Annars är det en relativ storage-stig -> bygg publik URL
  return `${SUPABASE_URL}/storage/v1/object/public/properties/${p}`;
}

async function getProperty(id: string): Promise<Property> {
  try {
    const { data } = await getJson<{ data: Property }>(`/properties/${id}`);
    return data;
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.startsWith("404")) notFound();
    throw err;
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prop = await getProperty(id);

  // Gör om paths till riktiga URL:er
  const heroUrl = prop.main_image_url ? toPublicUrl(prop.main_image_url) : "/file.svg";
  const gallery = Array.isArray(prop.image_urls)
    ? prop.image_urls.map((u) => toPublicUrl(u))
    : [];

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top actions */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-sm rounded border px-3 py-1 hover:bg-gray-50"
        >
          ← Tillbaka
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/booking/new?property_id=${id}`}
            className="rounded bg-black px-4 py-2 text-white hover:opacity-90"
          >
            Boka nu
          </Link>
        </div>
      </div>

      {/* Header + facts */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold">{prop.title}</h1>
          <div className="text-sm text-gray-600">
            {prop.location ?? "Okänd plats"}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border p-4">
          <div className="text-lg font-semibold">
            {prop.price_per_night} kr{" "}
            <span className="text-sm font-normal">/ natt</span>
          </div>
          <div className="mt-2 text-sm">
            {prop.is_active ? "Tillgänglig" : "Inte bokningsbar just nu"}
          </div>
          <Link
            href={`/booking/new?property_id=${id}`}
            className="mt-4 inline-block w-full rounded-lg bg-black px-4 py-2 text-center text-white hover:opacity-90"
          >
            Boka nu
          </Link>
        </aside>
      </div>

      {/* Hero image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl border">
        <Image
          src={heroUrl}
          alt={prop.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Description */}
      {prop.description && (
        <section className="prose max-w-none">
          <h2 className="text-xl font-semibold">Beskrivning</h2>
          <p className="mt-2">{prop.description}</p>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section>
          <h2 className="mb-3 text-xl font-semibold">Galleri</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((url, i) => (
              <div
                key={i}
                className="group relative w-full aspect-[4/3] overflow-hidden rounded-xl border"
              >
                <Image
                  src={url}
                  alt={`Bild ${i + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, (max-width:1200px) 33vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}