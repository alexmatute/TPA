// src/lib/wp.ts
import type { BlogPost } from "./types";
import { stripTags } from "./utils";

/** ==== Bases ==== */
const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";
const API_BASE = `${WP_BASE}/wp-json`;

// WP externo (solo usaremos /posts)
const WP_BASE_EXTERNAL =
  process.env.NEXT_PUBLIC_EXTERNAL_WP_BASE || "https://futureoffounders.com";
const API_BASE_EXTERNAL = `${WP_BASE_EXTERNAL}/wp-json`;

// Miniatura por defecto para cualquier item sin imagen
export const DEFAULT_THUMB = "/og-default.jpg";

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

/** ==== Featured/Card ==== */
export type FeaturedCard = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
};

/** ==== Utils ==== */
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

export function logWP(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[WP]", ...args);
  }
}

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

/** ==== Media / Author ==== */
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

/** ==== Type candidates ==== */
function candidatesFor(type: "post" | "case-study" | "external") {
  return type === "post"
    ? ["posts"]
    : type === "external"
    ? ["external", "externals", "external-posts", "external_posts"]
    : ["case-study", "case_study", "case-studies"];
}

/** ==== Mapping ==== */
export function toBlogPost(
  p: WpPost | WpPostLite,
  sourceOverride?: "wp" | "case" | "ext"
): BlogPost {
  const cover = wpCover(p);
  const author = wpAuthor(p);
  const date = (p as WpPost).date || (p as WpPostLite).date || "";

  return {
    slug: p.slug || "",
    source: sourceOverride || "wp",
    title: stripTags(p.title?.rendered || ""),
    excerpt: stripTags(p.excerpt?.rendered || ""),
    content: (p as WpPost).content?.rendered || null,
    date,
    dateFormatted: fmtDate(date),
    cover,
    author: author as any,
    tags: [],
  } as any;
}

/** ==== Cards ==== */
export function wpToCard(
  p: WpPost,
  _postType?: "post" | "case-study" | "external"
): FeaturedCard {
  const cover = wpCover(p);
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

export function toCard(
  p: WpPostLite,
  _postType?: "post" | "case-study" | "external"
): FeaturedCard {
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

/** ==== IDs helpers ==== */
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

/** ==== Fetchers por ID ==== */
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
        break;
      }
    } catch {}
  }

  const byId = new Map(found.map((p) => [p.id, p]));
  return unique.map((id) => byId.get(id)).filter(Boolean) as T[];
}

/** ==== Listados locales (WP base) ==== */
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
export async function listWpPosts(): Promise<BlogPost[]> {
  try {
    const data = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/posts?per_page=100&_embed=1`,
      { revalidate: 60 }
    );
    return data.map((p) => toBlogPost(p, "wp"));
  } catch {
    return [];
  }
}

/** ==== External posts: USAR POSTS DEL SITIO EXTERNO ==== */
/** No dependemos de un CPT ni de rest_base: solo /posts con _embed */
export async function fetchExternalPosts({
  limit = 8,
  revalidate = 60,
  requireImage = false,
}: {
  limit?: number;
  revalidate?: number | false;
  requireImage?: boolean;
} = {}) {
  try {
    const url = `${API_BASE_EXTERNAL}/wp/v2/posts?per_page=${limit}&_embed=1`;
    const rows = await fetchJSON<WpPostLite[]>(url, { revalidate });

    // Si piden imagen obligatoria, filtramos por featuredmedia
    const filtered = requireImage
      ? rows.filter((p) => !!p._embedded?.["wp:featuredmedia"]?.[0]?.source_url)
      : rows;

    return filtered;
  } catch {
    return [];
  }
}

/** ==== Case studies (WP local) ==== */
export async function listCaseStudyPosts(): Promise<BlogPost[]> {
  try {
    const data = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/case-study?per_page=100&_embed=1`,
      { revalidate: 60 }
    );
    return data.map((p) => toBlogPost(p, "case"));
  } catch {
    return [];
  }
}

/** ==== One by slug (local WP) ==== */
export async function getWpBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const arr = await fetchJSON<WpPost[]>(
      `${API_BASE}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&per_page=1`,
      { revalidate: 60 }
    );
    const p = arr?.[0];
    return p ? toBlogPost(p, "wp") : null;
  } catch {
    return null;
  }
}

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

/** ==== Featured (local WP) ==== */
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
        const filtered = rows.filter((p) => !!p._embedded?.["wp:featuredmedia"]?.[0]?.source_url);
        if (filtered.length) return filtered;
      } else {
        return rows;
      }
    }
  }
  return [];
}

/** ==== Case studies → cards (local WP) ==== */
export async function fetchCaseStudies({
  limit = 8,
  revalidate = 60,
} = {}) {
  try {
    const rows = await fetchJSON<WpPostLite[]>(
      `${API_BASE}/wp/v2/case-study?per_page=${limit}&_embed=1`,
      { revalidate }
    );
    return rows.map((p) => toCard(p, "case-study"));
  } catch {
    return [];
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

/** ==== Menú ==== */
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
