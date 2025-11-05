export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getJson } from "@/lib/http-server";
import type { Property } from "@/types/models";
import Gallery from "@/components/Gallery";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "") ?? "";

function toPublicUrl(p?: string | null): string {
  if (!p) return "/file.svg";
  if (p.startsWith("http://") || p.startsWith("https://") || p.startsWith("/")) return p;
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

export default async function PropertyPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const p = "then" in (params as any) ? await (params as Promise<{ id: string }>) : (params as { id: string });
  const { id } = p;

  const prop = await getProperty(id);

  const heroUrl = prop.main_image_url ? toPublicUrl(prop.main_image_url) : "/file.svg";
  const gallery = Array.isArray(prop.image_urls) ? prop.image_urls.map((u) => toPublicUrl(u)) : [];
  const photos = [heroUrl, ...gallery.filter((u) => u && u !== heroUrl)];

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm rounded-full border px-3 py-1 hover:bg-neutral-50">← Tillbaka</Link>
      </div>

      <section>
        {photos.length <= 1 ? (
          <div className="relative w-full overflow-hidden rounded-2xl border">
            <div className="relative aspect-[16/9]">
              <Image src={heroUrl} alt={prop.title} fill className="object-cover" sizes="(max-width:1024px) 100vw, 66vw" priority />
            </div>
          </div>
        ) : (
          <Gallery photos={photos} title={prop.title} />
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">{prop.title}</h1>
          <p className="text-sm text-neutral-600">{prop.location ?? "Okänd plats"}</p>
          {prop.description && (
            <section className="pt-2">
              <h2 className="mb-2 text-xl font-semibold">Beskrivning</h2>
              <p className="text-sm leading-6 text-neutral-800">{prop.description}</p>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-2xl border p-5 shadow-sm md:sticky md:top-6">
          <div className="flex items-baseline justify-between">
            <div className="text-xl font-semibold">
              {prop.price_per_night} kr <span className="text-sm font-normal text-neutral-500">/ natt</span>
            </div>
            <span className="rounded-full border px-2 py-0.5 text-xs">{prop.is_active ? "Tillgänglig" : "Inte bokningsbar"}</span>
          </div>

          <Link href={`/booking/new?property_id=${id}`} className="mt-4 block w-full rounded-lg bg-black px-4 py-2 text-center text-white hover:opacity-90">
            Boka nu
          </Link>

          <p className="mt-3 rounded-lg border p-3 text-xs text-neutral-600">Kostnader och skatter kan tillkomma. Du väljer datum på nästa sida.</p>
        </aside>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link href="/" className="text-sm rounded-full border px-3 py-1 hover:bg-neutral-50">← Tillbaka</Link>
        <Link href={`/booking/new?property_id=${id}`} className="text-sm rounded-full border px-3 py-1 hover:bg-neutral-50">Boka nu</Link>
      </div>
    </main>
  );
}