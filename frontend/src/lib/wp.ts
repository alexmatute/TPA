// src/lib/wp.ts
import type { BlogPost } from "./types";
import { stripTags } from "./utils";

/** ==== Bases ==== */
const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";
const API_BASE = `${WP_BASE}/wp-json`;

/** ==== WordPress Media Type ==== */
export type WPMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
};

/** ==== Author (embeds) ==== */
type WpAuthor = {
  name?: string;
  acf?: { title?: string };
  avatar_urls?: Record<string, string>; // "24","48","96"
};

/** ==== WordPress Post Types ==== */
export type WpPost = {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  sticky?: boolean;
  featured_media?: number;
  _embedded?: {
    ["wp:featuredmedia"]?: WPMedia[];
    author?: WpAuthor[];
  };
};

export type WpPostLite = {
  id: number;
  slug?: string;
  link?: string;
  date?: string;
  title?: { rendered?: string };
  excerpt?: { rendered?: string };
  content?: { rendered?: string };
  featured_media?: number;
  _embedded?: {
    ["wp:featuredmedia"]?: WPMedia[];
    author?: WpAuthor[];
  };
};

/** ==== Featured Card Type ==== */
export type FeaturedCard = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
};

/** ==== Utility Functions ==== */
export const strip = (html = "") => html.replace(/<[^>]+>/g, "").trim();

const fmtDate = (iso?: string) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso || "";
  }
};

/** Logger de desarrollo (no hace ruido en prod) */
export function logWP(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[WP]", ...args);
  }
}

/** ==== Fetch helper con control de revalidate ==== */
async function fetchJSON<T>(
  url: string,
  opts: { revalidate?: number | false } = {}
): Promise<T> {
  const res = await fetch(url, {
    next: typeof opts.revalidate === "number" ? { revalidate: opts.revalidate } : undefined,
  });
  if (!res.ok) throw new Error(`WP fetch failed: ${res.status} ${res.statusText} @ ${url}`);
  return (await res.json()) as T;
}

/** ==== Cover/Media Helpers ==== */
function pickBestSize(m?: WPMedia) {
  const sizes = m?.media_details?.sizes || {};
  const preferred = sizes["large"] || sizes["medium_large"] || sizes["medium"];
  const url = preferred?.source_url || m?.source_url || "";
  return {
    url,
    width: preferred?.width,
    height: preferred?.height,
    alt: m?.alt_text || "",
  };
}

function wpCover(p: WpPost | WpPostLite) {
  const m = p._embedded?.["wp:featuredmedia"]?.[0];
  if (!m) return undefined;
  const best = pickBestSize(m);
  return best.url ? best : undefined;
}

/** ==== Author helper ==== */
function wpAuthor(p: WpPost | WpPostLite) {
  const a = p._embedded?.author?.[0];
  if (!a) return undefined;
  const avatar =
    a.avatar_urls?.["96"] ||
    a.avatar_urls?.["48"] ||
    a.avatar_urls?.["24"] ||
    undefined;
  return {
    name: a.name || "",
    title: a.acf?.title || "",
    avatar,
  };
}

/** ==== Post Type Candidates ==== */
function candidatesFor(type: "post" | "case-study" | "external") {
  return type === "post"
    ? ["posts"]
    : type === "external"
    ? ["external", "externals", "external-posts"]
    : ["case-study", "case_study", "case-studies"];
}

/** ==== Mapeos ==== */
function toBlogPost(p: WpPost | WpPostLite): BlogPost {
  const cover = wpCover(p);
  const author = wpAuthor(p);
  const date = (p as WpPost).date || (p as WpPostLite).date || "";

  return {
    slug: p.slug || "",
    source: "wp",
    title: stripTags(p.title?.rendered || ""),
    excerpt: stripTags(p.excerpt?.rendered || ""),
    content: p.content?.rendered || null,
    date,
    dateFormatted: fmtDate(date),
    cover,
    author, // <- ahora viene normalizado
    tags: [],
  };
}

/** 👉 Export requerido por src/lib/blog.ts */
export function wpToCard(p: WpPost, postType?: "post" | "case-study" | "external"): FeaturedCard {
  const cover = wpCover(p);
  // Para case-study usamos /learn/slug (tu router ya lo espera así)
  const baseHref = `/learn/${p.slug}`;
  return {
    id: p.id,
    href: baseHref,
    title: stripTags(p.title?.rendered) || "",
    excerpt: stripTags(p.excerpt?.rendered) || "",
    imageUrl: cover?.url || undefined,
    imageAlt: cover?.alt || undefined,
  };
}

/** ==== Card estándar (útil para grids/carruseles) ==== */
export function toCard(p: WpPostLite, postType?: "post" | "case-study" | "external"): FeaturedCard {
  const baseHref = `/learn/${p.slug || ""}`;
  const cover = wpCover(p);
  return {
    id: p.id,
    href: baseHref,
    title: stripTags(p.title?.rendered ?? ""),
    excerpt: strip(p.excerpt?.rendered ?? ""),
    imageUrl: cover?.url,
    imageAlt: cover?.alt,
  };
}

/** ==== Normaliza Relationship de ACF: IDs, strings numéricas, objetos {id|ID} ==== */
export function normalizeIds(input: any): number[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((it) => {
      if (typeof it === "number") return it;
      if (typeof it === "string") return Number(it);
      if (it && typeof it === "object")
        return Number(it.id ?? it.ID ?? it.value ?? it.post?.id ?? it.post?.ID);
      return NaN;
    })
    .filter((n) => Number.isFinite(n) && n > 0);
}

/** ==== Fetch por IDs y tipo (preserva orden) ==== */
export async function fetchPostsByIds<T = WpPostLite>(
  ids: number[],
  type: "post" | "case-study" | "external" = "post",
  revalidate: number | false = 60
): Promise<T[]> {
  const unique = Array.from(new Set(ids)).filter(Boolean);
  if (!unique.length) return [];
  const found: WpPostLite[] = [];

  for (const base of candidatesFor(type)) {
    try {
      const url = `${API_BASE}/wp/v2/${base}?include=${unique.join(
        ","
      )}&_embed=1&orderby=include&per_page=${unique.length}`;
      const rows = await fetchJSON<WpPostLite[]>(url, { revalidate });
      if (Array.isArray(rows) && rows.length) {
        found.push(...rows);
        break; // primer base que funciona
      }
    } catch {
      // probar siguiente candidato
    }
  }

  const byId = new Map(found.map((p) => [p.id, p]));
  return unique.map((id) => byId.get(id)).filter(Boolean) as T[];
}

/** ==== Fetch por IDs mezclando tipos (Relationship mixto) ==== */
export async function fetchPostsByIdsMixed<T = WpPostLite>(
  ids: number[],
  types: Array<"post" | "case-study" | "external"> = ["case-study", "post"],
  revalidate: number | false = 60
): Promise<T[]> {
  if (!ids?.length) return [];
  const bag: WpPostLite[] = [];
  for (const t of types) {
    const rows = await fetchPostsByIds<WpPostLite>(ids, t, revalidate);
    bag.push(...rows);
  }
  const byId = new Map<number, WpPostLite>();
  for (const p of bag) byId.set(p.id, p);
  return ids.map((id) => byId.get(id)).filter(Boolean) as T[];
}

/** ==== Listado básico de posts ==== */
export async function listWpPosts(): Promise<BlogPost[]> {
  try {
    const data = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/posts?per_page=100&_embed=1`,
      { revalidate: 60 }
    );
    return data.map(toBlogPost);
  } catch {
    return [];
  }
}

/** ==== Post por slug (core) ==== */
export async function getWpBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const arr = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&per_page=1`,
      { revalidate: 60 }
    );
    const p = arr?.[0];
    return p ? toBlogPost(p) : null;
  } catch {
    return null;
  }
}

/** ==== Featured (opciones) ==== */
type FeaturedOpts = {
  type?: "post" | "case-study" | "external";
  limit?: number;
  via?: "sticky" | "tag" | "category";
  tagSlug?: string;
  category?: string | number;
  revalidate?: number | false;
  requireFeaturedImage?: boolean;
};

export async function fetchFeaturedPosts(opts: FeaturedOpts = {}) {
  const {
    type = "post",
    limit = 6,
    via,
    tagSlug = "featured",
    category = "featured",
    revalidate = 60,
    requireFeaturedImage = false,
  } = opts;

  const base = `${API_BASE}/wp/v2/${candidatesFor(type)[0]}?_embed=1&per_page=${limit}`;

  async function trySticky() {
    try {
      return await fetchJSON<WpPostLite[]>(`${base}&sticky=true`, { revalidate });
    } catch {
      return [];
    }
  }

  async function tryTag() {
    try {
      const tags = await fetchJSON<Array<{ id: number }>>(
        `${API_BASE}/wp/v2/tags?slug=${encodeURIComponent(tagSlug)}&per_page=1`,
        { revalidate }
      );
      const id = tags?.[0]?.id;
      if (!id) return [];
      return await fetchJSON<WpPostLite[]>(`${base}&tags=${id}`, { revalidate });
    } catch {
      return [];
    }
  }

  async function tryCategory() {
    try {
      let catId: number | null = null;
      if (typeof category === "number") {
        catId = category;
      } else {
        const cats = await fetchJSON<Array<{ id: number }>>(
          `${API_BASE}/wp/v2/categories?slug=${encodeURIComponent(category)}&per_page=1`,
          { revalidate }
        );
        catId = cats?.[0]?.id ?? null;
      }
      if (!catId) return [];
      return await fetchJSON<WpPostLite[]>(`${base}&categories=${catId}`, { revalidate });
    } catch {
      return [];
    }
  }

  const order =
    via === "sticky"
      ? [trySticky, tryTag, tryCategory]
      : via === "tag"
      ? [tryTag, trySticky, tryCategory]
      : via === "category"
      ? [tryCategory, trySticky, tryTag]
      : [trySticky, tryTag, tryCategory];

  for (const fn of order) {
    const rows = await fn();
    if (rows?.length) {
      if (requireFeaturedImage) {
        const filtered = rows.filter(p => {
          const hasMedia = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
          return !!hasMedia;
        });
        if (filtered.length) return filtered;
      } else {
        return rows;
      }
    }
  }
  return [];
}

/** ==== Featured combinando tipos ==== */
export async function fetchFeaturedAcrossTypes({
  types = ["case-study", "post"] as Array<"case-study" | "post" | "external">,
  limit = 8,
  via = "sticky" as "sticky" | "tag" | "category",
  tagSlug = "featured",
  category = "featured",
  revalidate = 60,
  requireFeaturedImage = false,
} = {}) {
  const bag: WpPostLite[] = [];
  for (const t of types) {
    const rows = await fetchFeaturedPosts({
      type: t,
      limit,
      via,
      tagSlug,
      category,
      revalidate,
      requireFeaturedImage: t === "external" ? true : requireFeaturedImage,
    });
    bag.push(...rows);
  }
  const seen = new Set<number>();
  const out: WpPostLite[] = [];
  for (const p of bag) {
    if (!seen.has(p.id)) {
      out.push(p);
      seen.add(p.id);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** ==== Slug único con tipo ==== */
export async function fetchPostBySlug(
  slug: string,
  type: "post" | "case-study" | "external" = "post",
  revalidate: number | false = 60
) {
  try {
    const url = `${API_BASE}/wp/v2/${candidatesFor(type)[0]}?slug=${encodeURIComponent(
      slug
    )}&_embed=1&per_page=1`;
    const rows = await fetchJSON<WpPostLite[]>(url, { revalidate });
    return rows?.[0] ?? null;
  } catch {
    return null;
  }
}

/** ==== ACF Home ==== */
export async function fetchHomeACF(slug = "home") {
  try {
    const url = `${API_BASE}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=acf`;
  const arr = await fetchJSON<Array<{ acf: any }>>(url, { revalidate: 0 });
    return arr?.[0] ?? null;
  } catch {
    return null;
  }
}

/** ==== Menú con fallbacks ==== */
export type WpMenuItem = {
  id?: number;
  title: string;
  url: string;
  children?: WpMenuItem[];
};

async function fetchMenuViaMU(location = "main") {
  const url = `${API_BASE}/site/v1/navigation/${encodeURIComponent(location)}`;
  return fetchJSON<WpMenuItem[]>(url, { revalidate: 0 });
}

async function fetchMenuViaWpApiMenus(identifier = "main") {
  const path = Number.isNaN(Number(identifier))
    ? `menus/slug/${encodeURIComponent(identifier)}`
    : `menus/${identifier}`;
  const url = `${API_BASE}/wp-api-menus/v2/${path}`;
  const data = await fetchJSON<any>(url, { revalidate: 0 });
  const items = (data?.items ?? []).map((it: any) => ({
    id: it.ID ?? it.id,
    title: (it.title || it.name || "").toString(),
    url: it.url,
    children: (it.children || []).map((c: any) => ({
      id: c.ID ?? c.id,
      title: (c.title || c.name || "").toString(),
      url: c.url,
      children: [],
    })),
  }));
  return items as WpMenuItem[];
}

async function fetchMenuViaCore(location = "main") {
  const url = `${API_BASE}/menus/v1/locations/${encodeURIComponent(location)}`;
  const data = await fetchJSON<any>(url, { revalidate: 0 }).catch(() => null as any);
  if (!data?.items) return [];
  const toItem = (it: any): WpMenuItem => ({
    id: it.id,
    title: it.title?.rendered ?? it.title ?? "",
    url: it.url,
    children: Array.isArray(it.children) ? it.children.map(toItem) : [],
  });
  return (data.items as any[]).map(toItem);
}

export async function fetchMenuServer(locationOrId = "main") {
  try {
    return await fetchMenuViaMU(locationOrId);
  } catch {}
  try {
    return await fetchMenuViaWpApiMenus(locationOrId);
  } catch {}
  try {
    return await fetchMenuViaCore(locationOrId);
  } catch {}
  return [];
}

/** ==== Función específica para posts externos con imagen ==== */
export async function fetchExternalPostsWithImage({
  limit = 10,
  via = "sticky" as "sticky" | "tag" | "category",
  tagSlug = "featured",
  category = "featured",
  revalidate = 60,
} = {}) {
  const candidates = ["external", "externals", "external-posts", "external_posts"];

  for (const endpoint of candidates) {
    try {
      const url = `${API_BASE}/wp/v2/${endpoint}?per_page=${limit}&_embed=1`;
      logWP(`Trying external endpoint: ${url}`);

      const data = await fetchJSON<WpPostLite[]>(url, { revalidate });

      if (Array.isArray(data) && data.length) {
        const withImage = data.filter(p => {
          const hasMedia = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
          const hasFeaturedMedia = p.featured_media && p.featured_media > 0;
          logWP(`Post ${p.id}: hasMedia=${!!hasMedia}, featured_media=${p.featured_media}`);
          return hasMedia || hasFeaturedMedia;
        });

        logWP(`Found ${withImage.length} external posts with images from ${endpoint}`);
        return withImage;
      }
    } catch (error) {
      logWP(`Failed to fetch from ${endpoint}:`, error);
    }
  }

  logWP("No external posts found in any endpoint");
  return [];
}

/** ==== Listado de posts externos (solo con imagen) ==== */
export async function listExternalPosts(): Promise<BlogPost[]> {
  try {
    const data = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/external?per_page=100&_embed=1`,
      { revalidate: 60 }
    );
    const withImage = data.filter(p => {
      const hasMedia = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
      return !!hasMedia;
    });
    return withImage.map(toBlogPost);
  } catch {
    try {
      const data = await fetchJSON<WpPost[]>(
        `${API_BASE}/wp/v2/externals?per_page=100&_embed=1`,
        { revalidate: 60 }
      );
      const withImage = data.filter(p => {
        const hasMedia = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        return !!hasMedia;
      });
      return withImage.map(toBlogPost);
    } catch {
      return [];
    }
  }
}

/** ==== Helpers para generar cards con tipo correcto ==== */
export function toCardWithType(p: WpPostLite, type: "post" | "case-study" | "external"): FeaturedCard {
  return toCard(p, type);
}
export function wpToCardWithType(p: WpPost, type: "post" | "case-study" | "external"): FeaturedCard {
  return wpToCard(p, type);
}

/** ==== Fetch de case studies (automáticamente con ruta correcta) ==== */
export async function fetchCaseStudies({
  limit = 10,
  via = "sticky" as "sticky" | "tag" | "category",
  tagSlug = "featured",
  category = "featured",
  revalidate = 60,
} = {}) {
  const posts = await fetchFeaturedPosts({
    type: "case-study",
    limit,
    via,
    tagSlug,
    category,
    revalidate,
  });

  return posts.map(p => toCard(p, "case-study"));
}

/** ==== Helper para debug de external posts ==== */
export async function debugExternalPosts() {
  logWP("=== Debugging External Posts ===");

  const candidates = ["external", "externals", "external-posts", "external_posts", "posts"];

  for (const endpoint of candidates) {
    try {
      const url = `${API_BASE}/wp/v2/${endpoint}?per_page=5&_embed=1`;
      logWP(`Testing endpoint: ${url}`);

      const data = await fetchJSON<WpPostLite[]>(url, { revalidate: 0 });

      if (Array.isArray(data)) {
        logWP(`✅ ${endpoint}: Found ${data.length} posts`);
        data.forEach(p => {
          const hasMedia = p._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
          const featuredMedia = p.featured_media;
          logWP(`  Post ${p.id} (${p.slug}): featured_media=${featuredMedia}, embedded_media=${!!hasMedia}`);
        });
      }
    } catch (error) {
      logWP(`❌ ${endpoint}: Error -`, error);
    }
  }
}
