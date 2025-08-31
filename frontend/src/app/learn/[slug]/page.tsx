// src/app/learn/[slug]/page.tsx
import {
  getBySlug,
  getPrevNext,
  getRelated,
  listAllSlugs
} from "@/lib/blog";

import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// ---- Tipos tolerantes (opcional) ----
type PostRef = {
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  cover?: { url?: string } | null;
};

type Post = PostRef & {
  html?: string;
  content?: string;
  author?: { name?: string; title?: string; avatar?: string };
  date?: string;
  dateFormatted?: string;
  seoTitle?: string;
  seoDescription?: string;
};

// ---- helpers locales ----
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

// para evitar que <Image> crashee si el host no está en next.config.js
const isAllowedHost = (url?: string) => {
  if (!url) return false;
  try {
    const h = new URL(url).hostname;
    return [
      "futureoffounders.com",
      "i0.wp.com",
      "i1.wp.com",
      "i2.wp.com",
      "secure.gravatar.com",
      "0.gravatar.com",
      "1.gravatar.com",
      "2.gravatar.com",
      "localhost",
    ].some((allowed) => h === allowed || h.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
};

// ---- SSG ----
export async function generateStaticParams() {
  const slugs = (await listAllSlugs?.()) || [];
  return slugs.map((slug) => ({ slug }));
}

// ---- SEO dinámico ----
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = (await getBySlug(params.slug)) as Post | null;
  if (!post) return { title: "Post not found" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || undefined;
  const og =
    (post.cover && (post.cover as any)?.url) ||
    post.coverImage ||
    "/og-default.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: og ? [{ url: og }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: og ? [og] : undefined,
    },
  };
}

// ---- Página ----
export default async function LearnPostPage({ params }: { params: { slug: string } }) {
  const post = (await getBySlug(params.slug)) as Post | null;
  if (!post) return notFound();

  const [{ previous, next }, relatedRaw] = await Promise.all([
    getPrevNext?.(params.slug) || Promise.resolve({}),
    getRelated?.(params.slug, 4) || Promise.resolve([] as PostRef[]),
  ]);

  const related = (relatedRaw || []) as PostRef[];

  const cover =
    (post.cover && (post.cover as any)?.url) ||
    post.coverImage ||
    undefined;

  // -------- Derivar autor y fecha de forma robusta --------
  const wpAny = post as any;

  const authorAvatar =
    post.author?.avatar ||
    wpAny?.author?.avatar ||
    wpAny?._embedded?.author?.[0]?.avatar_urls?.["96"] ||
    wpAny?._embedded?.author?.[0]?.avatar_urls?.["48"] ||
    undefined;

  const authorName =
    post.author?.name ||
    wpAny?.author?.name ||
    wpAny?._embedded?.author?.[0]?.name ||
    "—";

  const authorTitle =
    post.author?.title ||
    wpAny?.author?.title ||
    wpAny?._embedded?.author?.[0]?.acf?.title ||
    "";

  const displayDate =
    post.dateFormatted ||
    fmtDate(post.date) ||
    fmtDate(wpAny?.date) ||
    "";

  const shareUrlBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "";
  const sharePath = `/learn/${post.slug}`;
  const shareUrl = `${shareUrlBase}${sharePath}` || sharePath;

  return (
    // Fuerza tema claro SOLO aquí
    <div className="min-h-screen flex flex-col bg-white text-black dark:bg-white dark:text-black">

      <main className="flex-1">
        {/* Breadcrumbs NEGROS */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="text-sm text-black">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li aria-hidden className="opacity-60">/</li>
              <li><Link href="/learn" className="hover:underline">Learn</Link></li>
              <li aria-hidden className="opacity-60">/</li>
              <li className="font-medium truncate text-black">{post.title}</li>
            </ol>
          </nav>
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8">
          {/* TÍTULO NEGRO */}
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight text-black">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {authorAvatar && (
                isAllowedHost(authorAvatar) ? (
                  <Image
                    src={authorAvatar}
                    alt={authorName || "Author"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <img
                    src={authorAvatar}
                    alt={authorName || "Author"}
                    width={40}
                    height={40}
                    className="rounded-full"
                    loading="lazy"
                    decoding="async"
                  />
                )
              )}
              <div className="text-sm">
                <div className="font-medium text-black">{authorName}</div>
                {authorTitle && (
                  <div className="text-black/70">{authorTitle}</div>
                )}
              </div>
            </div>
            <div className="text-sm text-black/70">
              {displayDate}
            </div>
          </div>

          <div className="mt-6 h-1 w-28 rounded-full bg-emerald-500" />
        </section>

        {/* Imagen destacada */}
        {cover && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-8">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={cover}
                alt={post.title}
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Contenido en NEGRO */}
        <article
          className={[
            "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8",
            "prose prose-lg prose-neutral",
            "prose-headings:text-black prose-p:text-black prose-strong:text-black",
            "prose-li:text-black prose-blockquote:text-black",
            "prose-a:text-black hover:prose-a:underline",
            "prose-code:text-black prose-pre:text-black",
            "prose-hr:border-neutral-200",
            "prose-img:rounded-xl",
          ].join(" ")}
        >
          {post.html ? (
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          ) : (
            <div>{post.content}</div>
          )}
        </article>

        {/* Share */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center gap-4 text-sm text-black/70">
            <span className="opacity-70">Share:</span>
            <Link
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              className="hover:underline"
            >
              Facebook
            </Link>
            <Link
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              className="hover:underline"
            >
              LinkedIn
            </Link>
            <Link
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
              target="_blank"
              className="hover:underline"
            >
              X
            </Link>
          </div>
        </div>

        {/* Prev / Next */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between border-t pt-8">
            <div>
              {previous ? (
                <Link
                  href={`/learn/${(previous as any).slug}`}
                  className="group inline-flex items-center gap-2 text-emerald-700"
                >
                  <span aria-hidden>←</span>
                  <span className="group-hover:underline">Previous Article</span>
                </Link>
              ) : (
                <span className="opacity-40 text-black/40">—</span>
              )}
            </div>
            <div>
              {next ? (
                <Link
                  href={`/learn/${(next as any).slug}`}
                  className="group inline-flex items-center gap-2 text-emerald-700"
                >
                  <span className="group-hover:underline">Next Article</span>
                  <span aria-hidden>→</span>
                </Link>
              ) : (
                <span className="opacity-40 text-black/40">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14 mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-black">Related Articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r) => {
                const rCover = (r as any)?.cover?.url || r.coverImage;
                return (
                  <Link
                    key={r.slug}
                    href={`/learn/${r.slug}`}
                    className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-all p-4"
                  >
                    {rCover && (
                      <div className="overflow-hidden rounded-xl">
                        <Image
                          src={rCover}
                          alt={r.title}
                          width={640}
                          height={360}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    <h3 className="mt-4 font-semibold line-clamp-2 text-black">{r.title}</h3>
                    {r.excerpt && (
                      <p className="mt-2 text-sm text-black/70 line-clamp-3">{r.excerpt}</p>
                    )}
                    <div className="mt-4 inline-flex items-center gap-2 text-emerald-700">
                      <span>Read Case Study</span>
                      <span aria-hidden>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
