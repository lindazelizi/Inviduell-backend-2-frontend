export const dynamic = "force-dynamic"; // eller: export const revalidate = 0;
import Link from "next/link";
import Guard from "@/components/Guard";
import { getJson } from "@/lib/http-server";
import PageWrapper from "@/components/PageWrapper";

type Booking = {
  id: string;
  property_id: string;
  check_in: string;
  check_out: string;
  total_price: number;
  created_at: string;
};

export default async function BookingsPage({
  searchParams,
}: { searchParams: Promise<{ created?: string }> }) {
  const sp = await searchParams;
  const justCreated = sp?.created === "1";

  const res = await getJson<{ data: Booking[] }>("/bookings");
  const bookings = res.data;

  return (
    <PageWrapper>
      <Guard>
        <h1 className="text-2xl font-bold mb-4">Bookings</h1>

        {justCreated && (
          <div className="mb-4 rounded border border-green-300 bg-green-50 p-3 text-sm text-green-800">
            Booking skapad!
          </div>
        )}

        <div className="mb-4">
          <Link href="/booking/new" className="border rounded px-3 py-1 inline-block">
            + Ny booking
          </Link>
        </div>

        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id} className="border rounded p-3">
              <div className="font-semibold">#{b.id.slice(0, 8)}</div>
              <div className="text-sm">Property: {b.property_id}</div>
              <div className="text-sm">
                {b.check_in} → {b.check_out} · {b.total_price} kr
              </div>
            </li>
          ))}
        </ul>
      </Guard>
    </PageWrapper>
  );
}