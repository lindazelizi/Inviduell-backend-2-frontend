export const dynamic = "force-dynamic"; // alltid färska properties

import Link from "next/link";
import { getJson } from "@/lib/http-server";

type Property = {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
};

async function getProperties(): Promise<Property[]> {
  const res = await getJson<{ data: Property[] }>("/properties");
  // Backend-policyn släpper bara igenom aktiva ändå, men vi filtrerar lokalt med.
  return res.data.filter((p) => p.is_active);
}

export default async function HomePage() {
  const props = await getProperties();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Hitta ett boende</h1>
      <p className="text-sm text-gray-600 mb-6">
        Den här sidan är publik – du kan bläddra bland aktiva properties. När du trycker
        “Boka” leder vi dig till bokningsformuläret. Är du inte inloggad får du logga in först.
      </p>

      {props.length === 0 ? (
        <p className="text-sm text-gray-600">Inga aktiva properties just nu.</p>
      ) : (
        <ul className="space-y-3">
          {props.map((p) => (
            <li key={p.id} className="border rounded p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{p.title}</div>
                {p.location && <div className="text-sm">{p.location}</div>}
                <div className="text-sm">{p.price_per_night} kr / natt</div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/booking/new?propertyId=${p.id}`}
                  className="border rounded px-3 py-1"
                >
                  Boka
                </Link>
                <Link
                  href="/properties"
                  className="text-sm underline"
                  title="Se alla properties (intern vy)"
                >
                  Visa lista
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}