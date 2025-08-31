import { getExternalBySlug, listExternal } from "./external";
import { getWpBySlug, listWpPosts, toCard as wpToCard } from "./wp";

// src/lib/blog.ts
import type { BlogPost } from "./types";
import { sortByDateDesc } from "./utils";

/* =====================================================================================
 * LISTA (para /app/learn/page.tsx)  — WordPress + Externa como "cards"
 * ===================================================================================*/

// WP base (fallback local para dev)
const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";

/** Búsqueda/orden/paginación contra WP. Devuelve cards { id, href, title, excerpt, imageUrl? } */
export async function fetchPosts({
  page = 1,
  perPage = 8,
  q = "",
  sort = "newest", // "newest" | "oldest" | "title-az"
}: {
  page?: number;
  perPage?: number;
  q?: string;
  sort?: "newest" | "oldest" | "title-az";
}) {
  const orderby = sort === "title-az" ? "title" : "date";
  const order = sort === "oldest" ? "asc" : "desc";

  const url = new URL(`${WP_BASE}/wp-json/wp/v2/posts`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("_embed", "1");
  url.searchParams.set("orderby", orderby);
  url.searchParams.set("order", order);
  if (q) url.searchParams.set("search", q);

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    return {
      items: [] as ReturnType<typeof wpToCard>[],
      page,
      totalPages: 1,
      total: 0,
      url: url.toString(),
    } as const;
  }

  type WpPost = Parameters<typeof wpToCard>[0];
  const raw = (await res.json()) as WpPost[];
  const items = raw.map(wpToCard);
  const totalPages = Number(res.headers.get("X-WP-TotalPages")) || 1;
  const total = Number(res.headers.get("X-WP-Total")) || raw.length;

  return { items, page, totalPages, total, url: url.toString() } as const;
}

/** Cards desde API externa. (Demo: jsonplaceholder; adapta si tienes otra API) */
export async function fetchExternalPosts({
  page = 1,
  perPage = 8,
  q = "",
  sort = "newest",
}: {
  page?: number;
  perPage?: number;
  q?: string;
  sort?: "newest" | "oldest" | "title-az";
}) {
  const EXTERNAL_API =
    process.env.NEXT_PUBLIC_EXTERNAL_API ||
    "https://jsonplaceholder.typicode.com/posts";

  const res = await fetch(EXTERNAL_API, { cache: "no-store" });
  if (!res.ok) return { items: [] as any[], page, totalPages: 1, total: 0 } as const;

  type ExtPost = { id: number; title: string; body: string };
  let items = ((await res.json()) as ExtPost[]).map((p) => ({
    id: p.id,
    href: `/learn/${p.id}`,
    title: String(p.title || "").trim(),
    excerpt: String(p.body || "").slice(0, 160),
  }));

  if (q) {
    const ql = q.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(ql) ||
        (i.excerpt || "").toLowerCase().includes(ql)
    );
  }
  if (sort === "title-az") items.sort((a, b) => a.title.localeCompare(b.title));
  // newest/oldest no aplica aquí (sin fechas)

  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  return { items: paged, page, totalPages, total: items.length } as const;
}

/* =====================================================================================
 * DETALLE (para /app/learn/[slug]/page.tsx) — Aggregator con prev/next/related
 * ===================================================================================*/

/** Une solo WP + externos y ordena por fecha desc */
export async function listAll(): Promise<BlogPost[]> {
  const [ext, wp] = await Promise.all([listExternal(), listWpPosts()]);
  return sortByDateDesc([...ext, ...wp]);
}

/** Slugs de todas las fuentes */
export async function listAllSlugs(): Promise<string[]> {
  const all = await listAll();
  return all.map((p) => p.slug);
}

/** Busca por slug con prioridad: external → wp */
export async function getBySlug(slug: string): Promise<BlogPost | null> {
  const [extPost, wpPost] = await Promise.all([
    getExternalBySlug(slug),
    getWpBySlug(slug),
  ]);
  return extPost || wpPost || null;
}

/** Anterior / Siguiente dentro de la lista agregada y ordenada */
export async function getPrevNext(slug: string) {
  const all = await listAll();
  const idx = all.findIndex((p) => p.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx < all.length - 1 ? all[idx + 1] : null,
    next: idx > 0 ? all[idx - 1] : null,
  };
}

/** Relacionados por tags (rellena con recientes si faltan) */
export async function getRelated(slug: string) {
  const all = await listAll();
  const base = all.find((p) => p.slug === slug);
  if (!base) return all.slice(0, 3);

  const tagged = all.filter(
    (p) => p.slug !== slug && p.tags?.some((t) => base.tags?.includes(t!))
  );

  if (tagged.length >= 3) return tagged.slice(0, 3);

  const fill = all
    .filter((p) => p.slug !== slug && !tagged.includes(p))
    .slice(0, 3 - tagged.length);

  return [...tagged, ...fill].slice(0, 3);
}

/* =========================================================================
 * Sort extendido por tipo de fuente
 * ========================================================================= */
export async function listAllSorted(
  sort: "featured" | "post" | "case-study" | "external" | "all" = "all"
) {
  const [ext, wp] = await Promise.all([listExternal(), listWpPosts()]);
  const all = [...ext, ...wp];

  if (sort === "all") return sortByDateDesc(all);
  if (sort === "featured") return all.filter((p) => (p as any).featured === true);
  if (sort === "post") return all.filter((p) => p.source === "wp");
  if (sort === "case-study") return all.filter((p) => p.source === "case"); // no hay por ahora
  if (sort === "external") return all.filter((p) => p.source === "ext");

  return sortByDateDesc(all);
}
