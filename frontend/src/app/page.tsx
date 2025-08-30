import ProductTabs, { ProductTab } from "../components/ProductTabs";
import { fetchHomeACF, fetchMenuServer } from "@/lib/wp";

import FAQ from "../components/FAQ";
import FeatureTriplet from "@/components/FeatureTriplet";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import Navbar from "../components/Navbar";
import Privacy from "../components/privacy";
import { featureTripletData } from "@/data/featureTriplet";

function getUrl(img?: string | { url?: string }) {
  if (!img) return undefined;
  return typeof img === "string" ? img : img.url;
}

// Mapea un bloque de Flexible Content (o equivalente) a props del Hero
function mapAnyHero(block: any) {
  return {
    title: block?.title,
    subtitle: block?.subtitle,
    primary: {
      label: block?.primary?.label ?? block?.primary_label,
      href: block?.primary?.href ?? block?.primary_url,
    },
    secondary: {
      label: block?.secondary?.label ?? block?.secondary_label,
      href: block?.secondary?.href ?? block?.secondary_url,
    },
    bgImageUrl: getUrl(block?.bg_image ?? block?.bgImage),
  };
}

// Fallback “legacy” (primer hero con campos sueltos)
function mapLegacyHero(acf: any) {
  if (!acf) return {};
  return {
    title: acf.title,
    subtitle: acf.subtitle,
    primary: { label: acf.primary_label, href: acf.primary_url },
    secondary: { label: acf.secondary_label, href: acf.secondary_url },
    bgImageUrl: getUrl(acf.bg_image),
  };
}

// SEGUNDO HERO: campos con sufijo _footer
function mapFooterHero(acf: any) {
  if (!acf) return null;
  const hasAny =
    acf.hero_title_footer ||
    acf.hero_subtitle_footer ||
    acf.hero_primary_label_footer ||
    acf.hero_secondary_label_footer ||
    acf.hero_bg_image_footer;

  if (!hasAny) return null;

  return {
    title: acf.hero_title_footer,
    subtitle: acf.hero_subtitle_footer,
    primary: {
      label: acf.hero_primary_label_footer,
      href: acf.hero_primary_url_footer,
    },
    secondary: {
      label: acf.hero_secondary_label_footer,
      href: acf.hero_secondary_url_footer,
    },
    bgImageUrl: getUrl(acf.hero_bg_image_footer),
  };
}


export default async function Home() {
  const [menu, page] = await Promise.all([
    fetchMenuServer("main"),
    fetchHomeACF("home"),
  ]);

  const acf = page?.acf ?? null;

  // ---- HEROES ----
  const sections: any[] = Array.isArray(acf?.sections) ? acf.sections : [];

  // Si usas Flexible Content, aceptamos varios nombres de layout
  const heroesFromSections = sections
    .filter((b) => {
      const key = String(b?.acf_fc_layout || "").toLowerCase();
      return key === "hero" || key === "hero_block" || key === "herosection";
    })
    .map(mapAnyHero);

  // Elegimos top y footer según lo que exista
  let heroTop: any = null;
  let heroFooter: any = null;

  if (heroesFromSections.length) {
    heroTop = heroesFromSections[0];
    heroFooter = heroesFromSections[1] || mapFooterHero(acf); // si hay 2 en sections, usamos el 2º; si no, probamos los _footer
  } else {
    heroTop = mapLegacyHero(acf);
    heroFooter = mapFooterHero(acf);
  }


  const myTabs: ProductTab[] = [
    {
      label: "Lorem ipsum",
      heading: "Jorem ipsum dolor sit amet",
      description:
        "Worem ipsum dolor sit amet, consectetur adipiscing elit...",
      rows: [
        { text: "Rorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { text: "Porem ipsum dolor sit amet, consectetur adipiscing elit." },
        { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      ],
      imageUrl: "/images/tab-1.jpg",
      imageAlt: "Demo 1",
      ctas: [
        { label: "Book A Discovery Call", href: "#", variant: "primary" },
        { label: "View Case Study", href: "#", variant: "ghost" },
      ],
    },
    {
      label: "Corem ipsum dolor",
      heading: "Core product overview",
      description: "Descripción corta del segundo producto...",
      rows: [{ text: "Feature one" }, { text: "Feature two" }],
      imageUrl: "/images/tab-2.jpg",
      imageAlt: "Demo 2",
      ctas: [{ label: "Try for free", href: "#", variant: "primary" }],
    },
    {
      label: "Forem ipsum",
      heading: "Advanced analytics",
      description: "Resumen del tercer tab...",
      rows: [{ text: "Self-serve reports" }, { text: "Team dashboards" }],
      imageUrl: "/images/tab-3.jpg",
      imageAlt: "Demo 3",
      ctas: [{ label: "Contact sales", href: "#", variant: "primary" }],
    },
  ];

  return (
    <>
      <Navbar initialMenu={menu} />

      {/* Hero principal arriba */}
      <Hero acf={heroTop} />

      
      <ProductTabs title="Explore Our Product Suite" tabs={myTabs}/>
      <FeatureTriplet
        title={featureTripletData.title}
        items={featureTripletData.items}
        backgroundUrl={featureTripletData.backgroundUrl}
      />

      <FeaturedCarousel noBg/> 
    
      <FAQ faqs={acf?.faqs || []} />

      {/* Segundo hero controlado por los campos *_footer */}
      {heroFooter ? <Hero acf={heroFooter} /> : null}

      <Footer />
      <Privacy />
    </>
  );
}

