"use client";

import styles from "./style/FeaturedCarousel.module.scss";
import { useRef } from "react";

export type FeaturedItem = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
};

export default function FeaturedCarouselClient({
  eyebrow,
  heading,
  items,
}: {
  eyebrow: string;
  heading: string;
  items: FeaturedItem[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 24 : 320; // gap + ancho
    el.scrollBy({ left: step * dir, behavior: "smooth" });
  };

  return (
   <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-[var(--site-gutter,24px)]">
        {/* encabezado */}
        <div className="mb-6 text-center">
          <div className="mt-5 text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">{eyebrow}</div>
          <div className="mx-auto mt-3 h-1 w-40 rounded-full bg-[#00aa80]" />
          <h2 className="text-lg text-gray-500">
            {heading}
          </h2>
        </div>

        {/* carrusel */}
        <div className={`${styles.shell} relative`}>
          {/* fades laterales */}
          <div className={`${styles.fade} ${styles.left}`} aria-hidden />
          <div className={`${styles.fade} ${styles.right}`} aria-hidden />

          {/* track */}
          <div ref={trackRef} className={`${styles.track} snap-x snap-mandatory`}>
            {items.map((it) => (
              <article key={it.id} data-card className={`${styles.card} snap-start`}>
                <div className={`${styles.thumb} overflow-hidden rounded-xl`}>
                  {it.imageUrl ? (
                    // usa <img> para evitar problemas de next/image con hosts
                    <img
                      src={it.imageUrl}
                      alt={it.imageAlt || it.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900">{it.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{it.excerpt}</p>

                  <a
                    href={it.href}
                    className="mt-4 inline-flex items-center gap-2 font-medium text-gray-900"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read Case Study
                    <svg width="22" height="22" viewBox="0 0 24 24" className="text-[#00aa80]">
                      <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* controles */}
          <div className={styles.controls}>
            <button aria-label="Previous" onClick={() => scrollByCards(-1)} className={styles.btn}>
              ‹
            </button>
            <button aria-label="Next" onClick={() => scrollByCards(1)} className={styles.btn}>
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
