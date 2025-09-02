import {
  fetchPostBySlug,
  getWpBySlug,
  listCaseStudyPosts,
  listWpPosts,
  toBlogPost,
  toCard as wpToCard,
} from "./wp";
// src/lib/blog.ts
import { getExternalBySlug, listExternal } from "./external";

import type { BlogPost } from "./types";
import { sortByDateDesc } from "./utils";

// WP base (fallback local para dev)
const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";

/** Búsqueda/orden/paginación contra WP. Devuelve cards */
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

/* =====================================================================================
 * DETALLE — Aggregator con prev/next/related
 * ===================================================================================*/

/** Une case-study + WP (y externos si existieran) y ordena por fecha desc */
export async function listAll(): Promise<BlogPost[]> {
  const [caseStudies, wp, ext] = await Promise.all([
    listCaseStudyPosts(),
    listWpPosts(),
    listExternal().catch(() => []),
  ]);
  return sortByDateDesc([...caseStudies, ...wp, ...ext]);
}

/** Slugs de todas las fuentes */
export async function listAllSlugs(): Promise<string[]> {
  const all = await listAll();
  return all.map((p) => p.slug);
}

/** Busca por slug con prioridad: external → case-study → wp */
export async function getBySlug(slug: string): Promise<BlogPost | null> {
  const [extPost, caseRow, wpPost] = await Promise.all([
    getExternalBySlug(slug),
    fetchPostBySlug(slug, "case-study"),
    getWpBySlug(slug),
  ]);
  const casePost = caseRow ? toBlogPost(caseRow as any, "case") : null;
  return extPost || casePost || wpPost || null;
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
export async function getRelated(slug: string, take = 4) {
  const all = await listAll();
  const base = all.find((p) => p.slug === slug);
  if (!base) return all.slice(0, take);

  const tagged = all.filter(
    (p) => p.slug !== slug && p.tags?.some((t) => base.tags?.includes(t!))
  );

  if (tagged.length >= take) return tagged.slice(0, take);

  const fill = all
    .filter((p) => p.slug !== slug && !tagged.includes(p))
    .slice(0, take - tagged.length);

  return [...tagged, ...fill].slice(0, take);
}
