"use client";

import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

import s from "./style/ProductTabs.module.scss";

type Row = { text: string };
type CTA = { label: string; href: string; variant?: "primary" | "ghost" };

export type ProductTab = {
  label: string;               // texto del tab
  heading: string;             // título grande del panel
  description: string;         // párrafo descriptivo
  rows?: Row[];                // filas con regla inferior
  imageUrl?: string;           // imagen lado izquierdo
  imageAlt?: string;
  ctas?: CTA[];                // botones del final
};

type Props = {
  title?: string;              // “Explore Our Product Suite”
  underline?: boolean;         // línea verde debajo del título
  tabs?: ProductTab[];         // si no pasas, usa dummyData
  className?: string;
};

const dummyData: ProductTab[] = [
  {
    label: "Lorem ipsum",
    heading: "Jorem ipsum dolor sit amet",
    description:
      "Worem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis.",
    rows: [
      { text: "Rorem ipsum dolor sit amet, consectetur adipiscing elit." },
      { text: "Porem ipsum dolor sit amet, consectetur adipiscing elit." },
      { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    ],
    imageUrl: "/images/chart.jpg", // pon un .jpg en /public/images/chart.jpg
    imageAlt: "Chart demo",
    ctas: [
      { label: "Book A Discovery Call", href: "#", variant: "primary" },
      { label: "View Case Study", href: "#", variant: "ghost" },
    ],
  },
  {
    label: "Corem ipsum dolor",
    heading: "Core product overview",
    description:
      "Descripción corta del segundo producto. Puedes pasar tu propio contenido por props.",
    rows: [{ text: "Feature one" }, { text: "Feature two" }],
    imageUrl: "/images/chart.jpg",
    imageAlt: "Placeholder",
    ctas: [{ label: "Try for free", href: "#", variant: "primary" }],
  },
  {
    label: "Forem ipsum",
    heading: "Advanced analytics",
    description:
      "Resumen del tercer tab. Integra dashboards, métricas y growth loops.",
    rows: [{ text: "Self-serve reports" }, { text: "Team dashboards" }],
    imageUrl: "/images/chart.jpg",
    imageAlt: "Analytics",
    ctas: [{ label: "Contact sales", href: "#", variant: "primary" }],
  },
];

export default function ProductTabs({
  title = "Explore Our Product Suite",
  underline = true,
  tabs,
  className,
}: Props) {
  const data = useMemo(() => (tabs && tabs.length ? tabs : dummyData), [tabs]);
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLButtonElement[]>([]);

  useEffect(() => {
    if (active < 0 || active >= data.length) setActive(0);
  }, [active, data.length]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next =
      e.key === "ArrowRight" ? (active + 1) % data.length : (active - 1 + data.length) % data.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  };

  const current = data[active];

  return (
    <section className={`${s.root} ${className || ""}`}>
      <div className={s.container}>
        <header className={s.header}>
          <h2 className={s.title}>{title}</h2>
          {underline && <span className={s.underline} aria-hidden />}
        </header>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={title}
          className={s.tablist}
          onKeyDown={onKey}
        >
          {data.map((t, i) => {
            const selected = i === active;
            return (
              <button
                key={t.label}
                ref={(el) => {
                  if (el) tabsRef.current[i] = el;
                }}
                role="tab"
                aria-selected={selected}
                aria-controls={`panel-${i}`}
                id={`tab-${i}`}
                className={`${s.tab} ${selected ? s.tabActive : s.tabIdle}`}
                onClick={() => setActive(i)}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`panel-${active}`}
          aria-labelledby={`tab-${active}`}
          className={s.panel}
        >
          <div className={s.grid}>
            {/* Columna imagen */}
            <div className={s.media}>
              {current.imageUrl ? (
                <img
                  src={current.imageUrl}
                  alt={current.imageAlt || current.heading}
                  className={s.img}
                  loading="lazy"
                />
              ) : (
                <div className={s.imgPlaceholder} />
              )}
            </div>

            {/* Columna texto */}
            <div className={s.content}>
              <h3 className={s.heading}>{current.heading}</h3>
              <p className={s.description}>{current.description}</p>

              {current.rows?.length ? (
                <div className={s.rows}>
                  {current.rows.map((r, idx) => (
                    <div key={idx} className={s.row}>
                      {r.text}
                    </div>
                  ))}
                </div>
              ) : null}

              {current.ctas?.length ? (
                <div className={s.ctas}>
                  {current.ctas.map((c, idx) =>
                    c.variant === "ghost" ? (
                      <a key={idx} href={c.href} className={s.btnGhost}>
                        {c.label}
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          className={s.arrow}
                          aria-hidden
                        >
                          <path
                            d="M13 5l7 7-7 7M20 12H4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </a>
                    ) : (
                      <a key={idx} href={c.href} className={s.btnPrimary}>
                        {c.label}
                      </a>
                    )
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
