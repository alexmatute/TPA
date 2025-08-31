// src/data/home.ts
export const dummyLogos = [
  { image_url: "/logos/logo-a.svg", alt: "Logo A", href: "#" },
  { image_url: "/logos/logo-b.svg", alt: "Logo B", href: "#" },
  { image_url: "/logos/logo-c.svg", alt: "Logo C", href: "#" },
  { image_url: "/logos/logo-d.svg", alt: "Logo D", href: "#" },
  { image_url: "/logos/logo-e.svg", alt: "Logo E", href: "#" },
  { image_url: "/logos/logo-f.svg", alt: "Logo F", href: "#" },
];

export const dummyFeatures = [
  {
    icon_svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 7h18v2H3V7zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/></svg>`,
    title: "Content-first",
    description: "Modela tu contenido en WordPress y consúmelo sin ataduras desde el frontend.",
  },
  {
    icon_svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm1 5v6l4 2-1 1-5-3V7h2z"/></svg>`,
    title: "Performance",
    description: "Next.js con render híbrido y caché por ruta para cargas ultra rápidas.",
  },
  {
    icon_svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"/></svg>`,
    title: "Escalable",
    description: "Arquitectura por componentes y datos tipados que crece con tu producto.",
  },
];
