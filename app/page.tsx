import Image from "next/image";
import Link from "next/link";
import { getJson } from "@/lib/http-server";
import type { Property } from "@/types/models";
import { toPublicUrl } from "@/lib/images";
import Greeting from "@/components/Greeting";     // 👈 client-komponent
import SignupHint from "@/components/SignupHint"; // 👈 client-komponent

export const dynamic = "force-dynamic";

async function getPublicProps(): Promise<Property[]> {
  const { data } = await getJson<{ data: Property[] }>("/properties");
  return (data || []).filter((p) => p.is_active);
}

export default async function HomePage() {
  const props = await getPublicProps();

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <section>
        <Greeting />        {/* 👈 funkar nu utan server/client-krock */}
        <h1 className="text-2xl font-bold mb-2">Hitta ett boende</h1>
        <p className="text-sm text-gray-600 mb-4">
          Publik lista över aktiva boenden. Klicka för detaljer.
        </p>
        <SignupHint />
      </section>

      <section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p) => {
            const img = toPublicUrl("properties", p.main_image_url) ?? "/file.svg";
            return (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="block rounded-2xl border hover:shadow-md overflow-hidden"
              >
                <div className="relative w-full aspect-[4/3] bg-gray-100">
                  <Image src={img} alt={p.title} fill className="object-cover" loading="lazy" />
                </div>
                <div className="p-3">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-600">{p.location}</div>
                  <div className="text-sm">{p.price_per_night} kr / natt</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}