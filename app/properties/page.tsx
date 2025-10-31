export const dynamic = "force-dynamic"; // eller: export const revalidate = 0;

import Link from "next/link";
import { getJson } from "@/lib/http-server";
import PageWrapper from "@/components/PageWrapper";

type Property = {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
};

async function getProperties(): Promise<Property[]> {
  const { data } = await getJson<{ data: Property[] }>("/properties");
  return data;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const sp = await searchParams;
  const justCreated = sp?.created === "1";

  const props = await getProperties();

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Properties</h1>

      {justCreated && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
          Property skapad!
        </div>
      )}

      <div className="mb-4">
        <Link href="/properties/new" className="border rounded px-3 py-1 inline-block">
          + Ny property
        </Link>
      </div>

      {props.length === 0 ? (
        <p className="text-sm text-gray-600">Inga properties ännu. Skapa din första!</p>
      ) : (
        <ul className="space-y-3">
          {props.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <div className="font-semibold">{p.title}</div>
              {p.location && <div className="text-sm">{p.location}</div>}
              <div className="text-sm">
                {p.price_per_night} kr / natt {p.is_active ? "" : "· (inaktiv)"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </PageWrapper>
  );
}