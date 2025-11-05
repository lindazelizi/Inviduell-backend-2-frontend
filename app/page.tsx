export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import Greeting from "@/components/Greeting";
import SignupHint from "@/components/SignupHint";
import { getJson } from "@/lib/http-server";
import { toPublicUrl } from "@/lib/images";

type Property = {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
  main_image_url?: string | null;
};

async function getPublicProps(q?: string): Promise<Property[]> {
  const { data } = await getJson<{ data: Property[] }>("/properties");
  const list = (data || []).filter((p) => p.is_active);
  if (!q) return list;
  const needle = q.toLowerCase();
  return list.filter((p) => p.title.toLowerCase().includes(needle) || (p.location ?? "").toLowerCase().includes(needle));
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: { q?: string } | Promise<{ q?: string }>;
}) {
  const sp = searchParams && "then" in (searchParams as any) ? await (searchParams as Promise<{ q?: string }>) : ((searchParams as { q?: string } | undefined) ?? {});
  const q = sp?.q ?? "";

  const props = await getPublicProps(q);

  return (
    <main>
      <div className="h-2" />
      <section className="container-safe">
        <div className="rounded-3xl bg-gradient-to-r from-rose-100 via-pink-100 to-amber-100 dark:from-zinc-800 dark:via-zinc-800/80 dark:to-zinc-900 border border-zinc-200/60 dark:border-zinc-700 p-6 md:p-10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <Greeting />
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Hitta ett boende</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">Publik lista över aktiva boenden. Klicka för detaljer.</p>
            </div>
            <form action="/" method="get" className="w-full md:w-80" role="search">
              <label htmlFor="q" className="sr-only">Sök boende</label>
              <div className="relative">
                <input
                  id="q"
                  name="q"
                  defaultValue={q}
                  placeholder="Sök: titel eller plats…"
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800/60 px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-rose-400"
                />
                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm bg-black text-white hover:opacity-90">
                  Sök
                </button>
              </div>
            </form>
          </div>
          <SignupHint className="mt-4" />
        </div>
      </section>

      <section className="container-safe">
        {props.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Inga matchande boenden just nu.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {props.map((p, i) => {
              const img = toPublicUrl("properties", p.main_image_url) ?? "/file.svg";
              return (
                <Link key={p.id} href={`/properties/${p.id}`} className="block overflow-hidden card-like">
                  <div className="relative w-full aspect-[4/3] bg-zinc-100">
                    <Image
                      src={img}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-200 hover:scale-[1.02]"
                      sizes="(max-width:768px) 100vw, (max-width:1200px) 33vw, 33vw"
                      priority={i === 0}
                    />
                  </div>
                  <div className="p-4">
                    <div className="font-semibold truncate">{p.title}</div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-300 truncate">{p.location ?? "Okänd plats"}</div>
                    <div className="text-sm mt-1">
                      {p.price_per_night} kr <span className="text-zinc-500">/ natt</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <div className="h-10" />
    </main>
  );
}