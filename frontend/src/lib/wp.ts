// src/lib/wp.ts

/** ==== Base URLs (acepta 2 env vars y normaliza) ==== */
const RAW_BASE =
  process.env.NEXT_PUBLIC_WP_BASE_URL ||
  process.env.NEXT_PUBLIC_WP_BASE ||
  "http://localhost:8080";

export const WP_BASE = RAW_BASE.replace(/\/$/, "");
export const API_BASE = `${WP_BASE}/wp-json`;

/** Logger de desarrollo (no hace ruido en prod) */
export function logWP(...args: any[]) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[WP]", ...args);
  }
}
/* ---------------- Works ---------------- */
/** ==== Fetch helper con control de revalidate ==== */
type FetchInitPlus = RequestInit & { revalidate?: number | false };

async function fetchJSON<T>(path: string, init?: FetchInitPlus): Promise<T> {
  const url = path.startsWith("http") ? path : `${WP_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    next: { revalidate: init?.revalidate ?? 60 }, // default: 60s
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `WP ${res.status} ${res.statusText} :: ${url} :: ${text.slice(0, 180)}`
    );
  }
  return res.json() as Promise<T>;
}

/** ==== Utilidades ==== */
export const strip = (html = "") => html.replace(/<[^>]+>/g, "").trim();

export type WPMedia = {
  id?: number;
  source_url?: string;
  alt_text?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
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
  };
};

/** ==== Cover normalizado ==== */
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

export function withCover<T extends WpPostLite>(p: T) {
  const mediaArr = p._embedded?.["wp:featuredmedia"] || [];
  const media = Array.isArray(mediaArr) ? mediaArr[0] : undefined;
  const cover = pickBestSize(media);
  return { ...p, cover: cover.url ? cover : undefined };
}

/** ==== Card estándar (útil para grids/carruseles) ==== */
export type FeaturedCard = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
};

export function toCard(p: WpPostLite): FeaturedCard {
  const title = p.title?.rendered ?? "";
  const excerpt = strip(p.excerpt?.rendered ?? "");
  const href = p.link || "";
  const cover = withCover(p).cover;
  return {
    id: p.id,
    href,
    title,
    excerpt,
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

/** ==== Resolución de base REST por tipo ==== */
function candidatesFor(type: "post" | "case-study") {
  return type === "post" ? ["posts"] : ["case-study", "case_study", "case-studies"];
}

/** ==== Fetch por IDs y tipo (preserva orden) ==== */
export async function fetchPostsByIds<T = WpPostLite>(
  ids: number[],
  type: "post" | "case-study" = "post",
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
  types: Array<"post" | "case-study"> = ["case-study", "post"],
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

/** ==== Featured (sticky / tag / category) ==== */
type FeaturedOpts = {
  type?: "post" | "case-study";
  limit?: number;
  via?: "sticky" | "tag" | "category";
  tagSlug?: string;
  category?: number | string;
  revalidate?: number | false;
};

export async function fetchFeaturedPosts(opts: FeaturedOpts = {}) {
  const {
    type = "post",
    limit = 6,
    via,
    tagSlug = "featured",
    category = "featured",
    revalidate = 60,
  } = opts;

  const base = `${API_BASE}/wp/v2/${candidatesFor(type)[0]}?_embed=1&per_page=${limit}`;

  async function trySticky() {
    return fetchJSON<WpPostLite[]>(`${base}&sticky=true`, { revalidate }).catch(() => []);
  }
  async function tryTag() {
    const tags = await fetchJSON<Array<{ id: number }>>(
      `${API_BASE}/wp/v2/tags?slug=${encodeURIComponent(tagSlug)}&per_page=1`,
      { revalidate }
    ).catch(() => []);
    const id = tags?.[0]?.id;
    return id
      ? fetchJSON<WpPostLite[]>(`${base}&tags=${id}`, { revalidate }).catch(() => [])
      : [];
  }
  async function tryCategory() {
    let catId: number | null = null;
    if (typeof category === "number") {
      catId = category;
    } else {
      const cats = await fetchJSON<Array<{ id: number }>>(
        `${API_BASE}/wp/v2/categories?slug=${encodeURIComponent(category)}&per_page=1`,
        { revalidate }
      ).catch(() => []);
      catId = cats?.[0]?.id ?? null;
    }
    return catId
      ? fetchJSON<WpPostLite[]>(`${base}&categories=${catId}`, { revalidate }).catch(() => [])
      : [];
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
    if (rows?.length) return rows;
  }
  return [];
}

/** ==== Featured combinando tipos ==== */
export async function fetchFeaturedAcrossTypes({
  types = ["case-study", "post"] as Array<"case-study" | "post">,
  limit = 8,
  via = "sticky" as "sticky" | "tag" | "category",
  tagSlug = "featured",
  category = "featured",
  revalidate = 60,
} = {}) {
  const bag: WpPostLite[] = [];
  for (const t of types) {
    const rows = await fetchFeaturedPosts({ type: t, limit, via, tagSlug, category, revalidate });
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

/** ==== Slug único ==== */
export async function fetchPostBySlug(
  slug: string,
  type: "post" | "case-study" = "post",
  revalidate: number | false = 60
) {
  const url = `${API_BASE}/wp/v2/${candidatesFor(type)[0]}?slug=${encodeURIComponent(
    slug
  )}&_embed=1&per_page=1`;
  const rows = await fetchJSON<WpPostLite[]>(url, { revalidate }).catch(() => []);
  return rows?.[0] ?? null;
}

/** ==== ACF Home (naming consistente) ==== */
export async function fetchHomeACF(slug = "home") {
  const url = `${API_BASE}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=acf`;
  const arr = await fetchJSON<Array<{ acf: any }>>(url, { revalidate: 0 }).catch(() => []);
  return arr?.[0] ?? null;
}

/** ==== Menú con fallbacks ==== */
export type WpMenuItem = { id?: number; title: string; url: string; children?: WpMenuItem[] };

async function fetchMenuViaMU(location = "main") {
  const url = `${API_BASE}/site/v1/navigation/${encodeURIComponent(location)}`;
  return fetchJSON<WpMenuItem[]>(url, { revalidate: 0 });
}

async function fetchMenuViaWpApiMenus(identifier = "main") {
  // slug o id
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
  return items;
}

async function fetchMenuViaCore(location = "main") {
  // si tu tema expone esta ruta; ajusta si usas otra
  const url = `${API_BASE}/menus/v1/locations/${encodeURIComponent(location)}`;
  const data = await fetchJSON<any>(url, { revalidate: 0 });
  if (!data?.items) return [];
  const toItem = (it: any): WpMenuItem => ({
    id: it.id,
    title: it.title?.rendered ?? it.title ?? "",
    url: it.url,
    children: Array.isArray(it.children) ? it.children.map(toItem) : [],
  });
  return data.items.map(toItem);
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
