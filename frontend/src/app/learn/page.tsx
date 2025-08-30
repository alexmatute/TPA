import { fetchExternalPosts, fetchPosts } from "@/lib/blog";
import { fetchFeaturedPosts, fetchMenuServer, toCard } from "@/lib/wp";

import Footer from "@/components/Footer";
// src/app/learn/page.tsx
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Privacy from "@/components/privacy";
import SectionHeading from "@/components/SectionHeading";

const PER_PAGE = 8;
/* ---------------- works ---------------- */
/* ---------------- utils ---------------- */
const num = (v: unknown, d = 1) => {
  const n = Number(typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const str = (v: unknown, d = "") =>
  typeof v === "string" ? v : Array.isArray(v) ? v[0] || d : d;

/* ---------------- presentational (reusable) ---------------- */
function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <h2 className="text-lg font-semibold text-slate-900">{children}</h2>
    </div>
  );
}

function CardsGrid({
  items,
}: {
  items: Array<{
    id: number;
    href: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    imageAlt?: string;
  }>;
}) {
  return (
    <div className="grid gap-6 md:gap-7 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <article
          key={p.id}
          className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="relative h-40 w-full bg-slate-100">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.imageAlt || p.title}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">
                No image
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
              {p.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 line-clamp-3">
              {p.excerpt}
            </p>
            <a
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 font-medium text-slate-900 hover:underline"
            >
              Read Case Study
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-emerald-600">
                <path d="M5 12h14M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

function PageLink({
  href,
  children,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-700 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}

/* ---------------- page ---------------- */
export default async function LearnPage({
  // Next 15: searchParams es Promise
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const page = num(sp.page, 1);
  const q = str(sp.q, "");
  const sort = (str(sp.sort, "newest") as "newest" | "oldest" | "title-az");

  const wantFeatured = !q && page === 1;

  // menú
  const menu = await fetchMenuServer("main").catch(() => []);

  // fetch interno + externo + featured (solo en page 1 sin búsqueda)
  const [internal, externalRes, featuredRaw] = await Promise.all([
    fetchPosts({ page, perPage: PER_PAGE, q, sort }),
    fetchExternalPosts({ page: 1, perPage: 8, q: "", sort: "newest" }).catch(() => null),
    wantFeatured
      ? fetchFeaturedPosts({ type: "post", limit: 4, /* via: 'sticky' (default chain sticky->tag->cat) */ })
      : Promise.resolve([]),
  ]);

  const externalItems = externalRes?.items ?? [];
  const featured = (featuredRaw as any[])?.map(toCard) ?? [];

  // deduplicar "All" removiendo lo que está en Featured
  const excludeIds = new Set(featured.map((f) => f.id));
  const internalItems = internal.items.filter((it) => !excludeIds.has(it.id));

  const makeHref = (p: number) => {
    const usp = new URLSearchParams();
    if (q) usp.set("q", q);
    if (sort !== "newest") usp.set("sort", sort);
    usp.set("page", String(p));
    return `/learn?${usp.toString()}`;
  };

  return (
    <>
      <Navbar initialMenu={menu} />

      <section className="py-10 md:py-14 bg-white">
        <div className="mx-auto max-w-7xl px-[var(--site-gutter,24px)]">
          <SectionHeading eyebrow="Gorem ipsum dolor sit amet" title="Blog" as="h1" />

          {/* Search + Sort (GET, sin JS) */}
          <form
            className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            action="/learn"
            method="get"
          >
            <div className="relative w-full sm:max-w-md">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search…"
                className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              />
              <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    d="M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-600">Sort</label>
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-az">Title (A–Z)</option>
              </select>
              {/* reset page al buscar */}
              <input type="hidden" name="page" value="1" />
              <button
                type="submit"
                className="ml-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Search
              </button>
            </div>
          </form>

          {/* Featured */}
          {featured.length > 0 && (
            <>
              <SectionTitle>Featured Press Releases</SectionTitle>
              <CardsGrid items={featured} />
            </>
          )}

          {/* External */}
          {externalItems.length > 0 && (
            <>
              <SectionTitle className="mt-6">External API</SectionTitle>
              <CardsGrid items={externalItems} />
            </>
          )}

          {/* All */}
          <SectionTitle className="mt-6">All Press Releases</SectionTitle>
          <CardsGrid items={internalItems} />

          {/* Pager */}
          {internal.totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              <PageLink disabled={internal.page <= 1} href={makeHref(internal.page - 1)}>
                ‹
              </PageLink>
              <span className="px-3 py-2 text-sm text-slate-600">
                Page <strong>{internal.page}</strong> of <strong>{internal.totalPages}</strong>
              </span>
              <PageLink
                disabled={internal.page >= internal.totalPages}
                href={makeHref(internal.page + 1)}
              >
                ›
              </PageLink>
            </nav>
          )}

          {internalItems.length === 0 &&
            externalItems.length === 0 &&
            featured.length === 0 && (
              <p className="mt-10 text-center text-slate-500">
                No hay artículos para mostrar. Verifica contenido en ambas fuentes.
              </p>
            )}
        </div>
      </section>

      <Footer />
      <Privacy />
    </>
  );
}
