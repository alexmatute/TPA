"use client";

import styles from "./style/FeatureTriplet.module.scss";

type Item = {
  title: string;
  text: string;
  /** Puedes pasar:
   *  - emoji: "🚀"
   *  - svg: string con <svg ...>...</svg>
   *  - img: url absoluta o /ruta
   */
  icon?: { emoji?: string; svg?: string; img?: string };
};

export type FeatureTripletProps = {
  title: string;
  items: [Item, Item, Item]; // exactamente 3
  /** url del background (svg/png). Se ocultará en mobile */
  backgroundUrl?: string;
};

function Icon({ icon }: { icon?: Item["icon"] }) {
  if (!icon) return null;
  if (icon.emoji) {
    return <span className="text-4xl leading-none" aria-hidden="true">{icon.emoji}</span>;
  }
  if (icon.svg) {
    return (
      <span
        className="inline-block h-12 w-12"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  }
  if (icon.img) {
    return (
      <img
        src={icon.img}
        alt=""
        className="h-12 w-12 object-contain"
        loading="lazy"
        decoding="async"
      />
    );
  }
  return null;
}

export default function FeatureTriplet({ title, items, backgroundUrl }: FeatureTripletProps) {
  return (
    <section
      className={`${styles.wrap} py-16 md:py-24`}
      style={backgroundUrl ? ({ ["--ft-bg" as any]: `url(${backgroundUrl})` }) : undefined}
    >
      <div className="mx-auto max-w-7xl px-[var(--site-gutter,24px)]">
        {/* título */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            {title}
          </h2>
          <div className="mx-auto mt-4 h-1 w-48 rounded-full bg-gray-300" />
        </div>

        {/* 3 columnas */}
        <div className="grid gap-10 text-center md:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="mx-auto max-w-md">
              <div className="mb-4 flex justify-center">
                <Icon icon={it.icon} />
              </div>
              <h3 className="text-2xl font-medium text-gray-900">{it.title}</h3>
              <p className="mt-3 text-base text-gray-600">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
