export const mapBg = "/images/map-bg.svg"; // pon aquí tu ilustración grande

const svgTrendingUp = `
<svg viewBox="0 0 24 24">
  <path d="M3 17l6-6 4 4 7-7" />
  <path d="M14 8h6v6" />
</svg>`;

const svgBookmark = `
<svg viewBox="0 0 24 24">
  <path d="M7 4h10a2 2 0 0 1 2 2v14l-7-4-7 4V6a2 2 0 0 1 2-2z" />
</svg>`;

const svgFlow = `
<svg viewBox="0 0 24 24">
  <circle cx="7" cy="7" r="2" />
  <circle cx="17" cy="17" r="2" />
  <path d="M9 7h6a4 4 0 0 1 4 4v2M7 9v6a4 4 0 0 0 4 4h6" />
</svg>`;

export const featureTripletData = {
  title: "Rorem ipsum dolor",
  backgroundUrl: mapBg,
  items: [
    {
      title: "Vorem ipsum dolor",
      text: "Yorem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: { svg: svgTrendingUp },
    },
    {
      title: "Jorem ipsum dolor sit",
      text: "Korem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: { svg: svgBookmark },
    },
    {
      title: "Gorem ipsum",
      text: "Forem ipsum dolor sit amet, consectetur adipiscing elit.",
      icon: { svg: svgFlow },
    },
  ] as const,
};
