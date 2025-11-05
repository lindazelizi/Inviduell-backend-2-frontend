"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";

type Props = {
  photos: string[];
  title: string;
};

export default function Gallery({ photos, title }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const openAt = useCallback((i: number) => {
    setIdx(i);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const prev = useCallback(() => setIdx((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, prev, next, close]);

  if (!photos || photos.length === 0) return null;

  if (photos.length === 1) {
    return (
      <button
        type="button"
        onClick={() => openAt(0)}
        className="group relative block w-full overflow-hidden rounded-2xl border cursor-zoom-in"
        title="Visa bild"
      >
        <div className="relative aspect-[16/9]">
          <Image
            src={photos[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.01]"
            sizes="100vw"
            priority
          />
        </div>
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl border">
          <button
            type="button"
            onClick={() => openAt(0)}
            className="relative col-span-2 row-span-2 cursor-zoom-in"
            title="Visa bild"
          >
            <div className="relative h-full w-full min-h-[280px]">
              <Image
                src={photos[0]}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            </div>
          </button>

          {photos.slice(1, 5).map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openAt(i + 1)}
              className="relative cursor-zoom-in"
              title="Visa bild"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={url}
                  alt={`${title} – bild ${i + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 50vw, 25vw"
                />
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openAt(0)}
          className="absolute right-3 top-3 rounded-full border bg-white/90 px-3 py-1 text-xs shadow hover:bg-white"
          title="Visa alla foton"
        >
          Visa alla foton
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <div className="relative w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
              <Image
                src={photos[idx]}
                alt={`${title} – bild ${idx + 1} av ${photos.length}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>

            <button
              type="button"
              onClick={close}
              className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-sm shadow hover:bg-white"
              aria-label="Stäng"
              title="Stäng"
            >
              Stäng
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow hover:bg-white"
                  aria-label="Föregående bild"
                  title="Föregående"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm shadow hover:bg-white"
                  aria-label="Nästa bild"
                  title="Nästa"
                >
                  →
                </button>
              </>
            )}

            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-xs shadow">
              {idx + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}