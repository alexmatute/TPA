// TUS utilidades de datos (ya compatibles con tu blog.ts)
import {
  getAllPostSlugs,
  getPostBySlug,
  getPrevNext,
  getRelatedPosts,
} from "@/lib/blog";

import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
// src/app/learn/[slug]/page.tsx
import type { Metadata } from "next";
// TUS componentes existentes
import Navbar from "@/components/Navbar";
import Privacy from "@/components/privacy";
import { notFound } from "next/navigation";

type PageProps = { params: { slug: string } };

// ---- SEO dinámico ----
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || "";
  const og = post.coverImage || "/og-default.jpg";
  return {
    title,
    description,
    openGraph: { title, description, type: "article", images: [{ url: og }] },
    twitter: { card: "summary_large_image", title, description, images: [og] },
  };
}

// ---- SSG opcional ----
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs?.();
  return (slugs || []).map((s) => ({ slug: s }));
}

export default async function LearnPostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();

  const { previous, next } = (await getPrevNext?.(params.slug)) || {};
  const related = (await getRelatedPosts?.(params.slug, 4)) || [];

  const shareUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/learn/${post.slug}` || `/learn/${post.slug}`;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8">
          <nav className="text-sm text-neutral-500">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li aria-hidden className="opacity-60">/</li>
              <li><Link href="/learn" className="hover:underline">Learn</Link></li>
              <li aria-hidden className="opacity-60">/</li>
              <li className="text-neutral-900 dark:text-neutral-100 font-medium truncate">
                {post.title}
              </li>
            </ol>
          </nav>
        </div>

        {/* Hero: título/autor/fecha + subrayado */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-8">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {post.author?.avatar && (
                <Image
                  src={post.author.avatar}
                  alt={post.author?.name || "Author"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="text-sm">
                <div className="font-medium">{post.author?.name || "—"}</div>
                {post.author?.title && (
                  <div className="text-neutral-500">{post.author.title}</div>
                )}
              </div>
            </div>
            <div className="text-sm text-neutral-500">
              {post.dateFormatted || post.date || ""}
            </div>
          </div>

          {/* subrayado verde como en el PDF */}
          <div className="mt-6 h-1 w-28 rounded-full bg-emerald-500" />
        </section>

        {/* Imagen destacada redondeada */}
        {post.coverImage && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-8">
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1600}
                height={900}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Cuerpo del artículo */}
        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8 prose prose-lg dark:prose-invert">
          {post.html ? (
            <div dangerouslySetInnerHTML={{ __html: post.html }} />
          ) : (
            <div>{post.content}</div>
          )}
        </article>

        {/* Share */}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center gap-4 text-sm text-neutral-600">
            <span className="opacity-70">Share:</span>
            <Link
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              className="hover:underline"
            >
              Facebook
            </Link>
            <Link
              href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                shareUrl
              )}&title=${encodeURIComponent(post.title)}`}
              target="_blank"
              className="hover:underline"
            >
              LinkedIn
            </Link>
            <button
              className="hover:underline"
              onClick={async () => {
                try {
                  await navigator.share?.({ title: post.title, url: `/learn/${post.slug}` });
                } catch {}
              }}
            >
              Share
            </button>
          </div>
        </div>

        {/* Prev / Next */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14">
          <div className="flex items-center justify-between border-t pt-8">
            <div>
              {previous ? (
                <Link
                  href={`/learn/${previous.slug}`}
                  className="group inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400"
                >
                  <span aria-hidden>←</span>
                  <span className="group-hover:underline">Previous Article</span>
                </Link>
              ) : (
                <span className="opacity-40">—</span>
              )}
            </div>
            <div>
              {next ? (
                <Link
                  href={`/learn/${next.slug}`}
                  className="group inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400"
                >
                  <span className="group-hover:underline">Next Article</span>
                  <span aria-hidden>→</span>
                </Link>
              ) : (
                <span className="opacity-40">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Related Articles (4) */}
        {related.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 mt-14 mb-16">
            <h2 className="text-2xl md:text-3xl font-semibold">Related Articles</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((r: any) => (
                <Link
                  key={r.slug}
                  href={`/learn/${r.slug}`}
                  className="rounded-2xl border bg-white/70 dark:bg-white/5 shadow-sm hover:shadow-md transition-all p-4"
                >
                  {r.coverImage && (
                    <div className="overflow-hidden rounded-xl">
                      <Image
                        src={r.coverImage}
                        alt={r.title}
                        width={640}
                        height={360}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <h3 className="mt-4 font-semibold line-clamp-2">{r.title}</h3>
                  {r.excerpt && (
                    <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{r.excerpt}</p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <span>Read Case Study</span>
                    <span aria-hidden>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Privacy (tu componente existente) */}
        <div className="border-t">
          <Privacy />
        </div>
      </main>

      <Footer />
    </div>
  );
}
