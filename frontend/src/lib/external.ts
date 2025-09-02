// src/lib/external.ts
// Fuente: WordPress externo (futureoffounders.com)
import type { BlogPost } from "./types";

const WP_BASE_EXTERNAL =
  process.env.NEXT_PUBLIC_EXTERNAL_WP_BASE || "https://futureoffounders.com";
const API_BASE_EXTERNAL = `${WP_BASE_EXTERNAL}/wp-json`;

type WPMedia = {
  source_url?: string;
  alt_text?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width: number; height: number }>;
  };
};

type WpAuthor = {
  name?: string;
  acf?: { title?: string };
  avatar_urls?: Record<string, string>;
};

type WpPost = {
  id: number;
  date: string;
  slug: string;
  link?: string;
  title: { rendered: string };
  excerpt?: { rendered: string };
  content?: { rendered: string };
  _embedded?: {
    ["wp:featuredmedia"]?: WPMedia[];
    author?: WpAuthor[];
  };
};

const stripTags = (html = "") => html.replace(/<[^>]+>/g, "").trim();

function pickBestSize(m?: WPMedia) {
  const sizes = m?.media_details?.sizes || {};
  const preferred = sizes["large"] || sizes["medium_large"] || sizes["medium"];
  const url = preferred?.source_url || m?.source_url || "";
  return { url, alt: m?.alt_text || "" };
}

function coverOf(p: WpPost) {
  const m = p._embedded?.["wp:featuredmedia"]?.[0];
  if (!m) return undefined;
  const { url, alt } = pickBestSize(m);
  return url ? { url, alt } : undefined;
}

function authorOf(p: WpPost) {
  const a = p._embedded?.author?.[0];
  if (!a) return undefined;
  const avatar =
    a.avatar_urls?.["96"] || a.avatar_urls?.["48"] || a.avatar_urls?.["24"];
  return { name: a.name || "", title: a.acf?.title || "", avatar };
}

function toBlogPost(p: WpPost): BlogPost {
  const cover = coverOf(p);
  const author = authorOf(p);
  const date = p.date || "";
  return {
    slug: p.slug || "",
    source: "ext",
    title: stripTags(p.title?.rendered || ""),
    excerpt: stripTags(p.excerpt?.rendered || ""),
    content: p.content?.rendered || null,
    date,
    dateFormatted: date ? new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "long", day: "2-digit"
    }).format(new Date(date)) : "",
    cover,
    author: author as any,
    tags: [],
    link: p.link || `${WP_BASE_EXTERNAL}/?p=${p.id}`,
  } as any;
}

async function fetchJSON<T>(url: string, revalidate: number | false = 60): Promise<T> {
  const res = await fetch(url, {
    next: typeof revalidate === "number" ? { revalidate } : undefined,
  });
  if (!res.ok) throw new Error(`External WP fetch ${res.status} @ ${url}`);
  return (await res.json()) as T;
}

/** Lista de posts externos (como BlogPost) */
export async function listExternal(limit = 100): Promise<BlogPost[]> {
  try {
    const rows = await fetchJSON<WpPost[]>(
      `${API_BASE_EXTERNAL}/wp/v2/posts?per_page=${limit}&_embed=1`,
      60
    );
    return rows.map(toBlogPost);
  } catch {
    return [];
  }
}

/** Obtener un post externo por slug */
export async function getExternalBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const rows = await fetchJSON<WpPost[]>(
      `${API_BASE_EXTERNAL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&per_page=1`,
      60
    );
    const p = rows?.[0];
    return p ? toBlogPost(p) : null;
  } catch {
    return null;
  }
}
