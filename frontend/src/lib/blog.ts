// src/lib/blog.ts
import { WP_BASE, logWP } from "./wp";

export type WPCard = {
  id: number;
  href: string;
  title: string;
  excerpt: string;
  imageUrl?: string;
  imageAlt?: string;
  date?: string;
};

type WPMedia = { source_url?: string; alt_text?: string };
type WPPost = {
  id: number;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: { ["wp:featuredmedia"]?: WPMedia[] };
};

/* ---------------- works ---------------- */
const strip = (html = "") => html.replace(/<[^>]+>/g, "").trim();

const toCard = (p: WPPost): WPCard => {
  const m = p._embedded?.["wp:featuredmedia"]?.[0] || {};
  return {
    id: p.id,
    href: p.link,
    title: strip(p.title?.rendered || ""),
    excerpt: strip(p.excerpt?.rendered || ""),
    imageUrl: m.source_url || "",
    imageAlt: m.alt_text || "",
    date: p.date,
  };
};

/** Fetch genérico a /wp-json/wp/v2/posts */
export async function fetchPosts({
  page = 1,
  perPage = 8,
  q = "",
  sort = "newest", // 'newest' | 'oldest' | 'title-az'
  exclude = [],
}: {
  page?: number;
  perPage?: number;
  q?: string;
  sort?: "newest" | "oldest" | "title-az";
  exclude?: number[];
}): Promise<{ items: WPCard[]; total: number; totalPages: number; page: number; url: string }> {
  let orderby = "date";
  let order = "desc";
  if (sort === "oldest") order = "asc";
  if (sort === "title-az") orderby = "title";

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: "1",
    orderby,
    order,
  });
  if (q) params.set("search", q);
  if (exclude.length) params.set("exclude", exclude.join(","));

  const url = `${WP_BASE}/wp-json/wp/v2/posts?${params.toString()}`;
  logWP("GET", url);

  const res = await fetch(url, {
    // evita caches molestas en desarrollo
    cache: "no-store",
    // en prod puedes cambiar a: next: { revalidate: 60 }
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logWP("ERROR", res.status, url, text?.slice(0, 200));
    // intenta autocorregir página fuera de rango
    const totalPagesHdr = Number(res.headers.get("X-WP-TotalPages") || 1) || 1;
    const safe = Math.min(Math.max(1, page), totalPagesHdr);
    if (safe !== page) {
      const retryUrl = `${WP_BASE}/wp-json/wp/v2/posts?${new URLSearchParams({
        ...Object.fromEntries(params.entries()),
        page: String(safe),
      })}`;
      logWP("RETRY", retryUrl);
      const retry = await fetch(retryUrl, { cache: "no-store" });
      const data = retry.ok ? ((await retry.json()) as WPPost[]) : [];
      return {
        items: data.map(toCard),
        total: Number(retry.headers.get("X-WP-Total") || 0),
        totalPages: Number(retry.headers.get("X-WP-TotalPages") || 1) || 1,
        page: safe,
        url: retryUrl,
      };
    }
    return { items: [], total: 0, totalPages: 1, page: 1, url };
  }

  const data = (await res.json()) as WPPost[];
  return {
    items: data.map(toCard),
    total: Number(res.headers.get("X-WP-Total") || 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") || 1) || 1,
    page,
    url,
  };
}

/** Ping de diagnóstico a /wp-json/ */
export async function wpPing() {
  const url = `${WP_BASE}/wp-json/`;
  logWP("PING", url);
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, base: WP_BASE, sample: body.slice(0, 200) };
}

export const EXTERNAL_WP_BASE =
  process.env.NEXT_PUBLIC_EXTERNAL_WP_BASE ?? "https://futureoffounders.com";

/** Igual que fetchPosts, pero contra el WP externo */
export async function fetchExternalPosts({
  page = 1,
  perPage = 8,
  q = "",
  sort = "newest", // 'newest' | 'oldest' | 'title-az'
}: {
  page?: number;
  perPage?: number;
  q?: string;
  sort?: "newest" | "oldest" | "title-az";
}) {
  let orderby = "date";
  let order = "desc";
  if (sort === "oldest") order = "asc";
  if (sort === "title-az") orderby = "title";

  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
    _embed: "1",
    orderby,
    order,
  });
  if (q) params.set("search", q);

  const url = `${EXTERNAL_WP_BASE}/wp-json/wp/v2/posts?${params.toString()}`;
  logWP("EXT GET", url);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    logWP("EXT ERROR", res.status, url, text?.slice(0, 200));
    return { items: [] as ReturnType<typeof toCard>[], total: 0, totalPages: 1, page, url };
  }

  const data = (await res.json()) as WPPost[];
  return {
    items: data.map(toCard),
    total: Number(res.headers.get("X-WP-Total") || 0),
    totalPages: Number(res.headers.get("X-WP-TotalPages") || 1) || 1,
    page,
    url,
    base: EXTERNAL_WP_BASE,
  };
}