// ---- MENÚ ----
export type MenuItem = { title: string; url: string; children?: MenuItem[] };

export async function getMenuFromNavigation(slug = "main"): Promise<MenuItem[]> {
  const res = await fetch(`/api/menu?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// ---- PÁGINA + ACF ----
export type FAQItem = { question: string; answer: string };
export type HomeACF = {
  hero_title?: string;
  hero_subtitle?: string;
  hero_primary_label?: string;
  hero_primary_url?: string;
  hero_secondary_label?: string;
  hero_secondary_url?: string;
  faqs?: FAQItem[];
};
export type PageWithACF = { id: number; slug: string; title?: any; acf?: HomeACF | null };

export async function getPageBySlug(slug: string): Promise<PageWithACF | null> {
  const res = await fetch(`/api/page?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json ?? null;
}
