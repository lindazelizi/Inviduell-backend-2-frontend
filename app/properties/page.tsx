import { getJson } from "@/lib/http";
import PageWrapper from "@/components/PageWrapper";

type Property = {
  id: string;
  title: string;
  location: string | null;
  price_per_night: number;
  is_active: boolean;
};

async function getProperties(): Promise<Property[]> {
  const res = await getJson<{ data: Property[] }>("/properties");
  return res.data;
}

export default async function PropertiesPage() {
  const props = await getProperties();
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Properties</h1>
      {/* ovanför <ul> … */}
<div className="mb-4">
  <a href="/properties/new" className="border rounded px-3 py-1 inline-block">+ Ny property</a>
</div>
      <ul className="space-y-3">
        {props.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <div className="font-semibold">{p.title}</div>
            {p.location && <div className="text-sm">{p.location}</div>}
            <div className="text-sm">
              {p.price_per_night} kr / natt {p.is_active ? "" : "(inaktiv)"}
            </div>
          </li>
        ))}
      </ul>
    </PageWrapper>
  );
}