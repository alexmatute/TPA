export type ExternalQuery = {
  page: number;
  perPage: number;
  q?: string;
  sort?: "newest" | "popular";
};

export type ExternalPost = {
  id: string;
  title: string;
  excerpt: string;
  cover?: string | null;
  url?: string;
  date?: string;
};

// Implementación mínima (ajusta URL/campos)
export async function fetchExternalAPosts(params: ExternalQuery): Promise<ExternalPost[]> {
  const { page, perPage, q = "", sort = "newest" } = params;

  // TODO: apunta a tu endpoint real
  const url = `${process.env.EXTERNAL_API_URL}/posts?page=${page}&perPage=${perPage}&q=${encodeURIComponent(q)}&sort=${sort}`;

  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];

  const json = await res.json();
  // Normaliza a tu shape
  const items = Array.isArray(json?.items) ? json.items : [];
  return items.map((it: any) => ({
    id: String(it.id ?? it.slug ?? crypto.randomUUID()),
    title: String(it.title ?? ""),
    excerpt: String(it.excerpt ?? it.summary ?? ""),
    cover: it.cover ?? it.image ?? null,
    url: it.url ?? null,
    date: it.date ?? it.publishedAt ?? null,
  }));
}

export default fetchExternalAPosts;
