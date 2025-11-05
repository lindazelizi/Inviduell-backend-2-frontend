"use client";

import Image from "next/image";
import Link from "next/link";
import { toPublicUrl } from "@/lib/images";

type Props = {
  id: string;
  title: string;
  location?: string | null;
  price_per_night: number;
  main_image_url?: string | null;
  is_active?: boolean;
};

export default function PropertyCard({
  id,
  title,
  location,
  price_per_night,
  main_image_url,
  is_active = true,
}: Props) {
  const img = toPublicUrl("properties", main_image_url) ?? "/file.svg";

  return (
    <Link href={`/properties/${id}`} className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
          loading="lazy"
        />
        {!is_active && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium shadow">
            Inaktiv
          </span>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold">{title}</h3>
          <div className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs">
            {price_per_night} kr <span className="text-neutral-500">/ natt</span>
          </div>
        </div>
        <p className="mt-1 line-clamp-1 text-sm text-neutral-600">{location ?? "Okänd plats"}</p>
      </div>
    </Link>
  );
}