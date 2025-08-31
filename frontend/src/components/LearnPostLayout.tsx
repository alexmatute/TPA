import type { BlogPost } from "@/lib/types";
import Footer from "@/components/Footer";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Privacy from "@/components/privacy";

type PrevNext = { prev: BlogPost | null; next: BlogPost | null };

export default function LearnPostLayout({
  post,
  related,
  prevNext,
}: {
  post: BlogPost;
  related: BlogPost[];
  prevNext: PrevNext;
}) {
  const date = post.date ? new Date(post.date).toLocaleDateString() : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900">
      <Navbar />

      {/* Hero */}
      <header className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-10">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          {post.source === "case" && (
            <span className="rounded-full bg-black text-white px-3 py-1">
              Featured Case Study
            </span>
          )}
          {post.source && (
            <span className="uppercase tracking-wide">{post.source}</span>
          )}
          {date && <span>• {date}</span>}
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold mt-4 leading-tight">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-3 text-lg text-neutral-600 max-w-3xl">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Cover */}
      {post.cover?.url ? (
        <div className="max-w-6xl mx-auto w-full mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover.url}
            alt={post.cover.alt || post.title}
            className="w-full h-auto rounded-2xl"
          />
        </div>
      ) : null}

      {/* Content */}
      <main className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-10 flex-1">
        <article
          className="prose prose-neutral max-w-none"
          dangerouslySetInnerHTML={{
            __html: post.content ?? "<p>No content.</p>",
          }}
        />

        {/* Prev / Next */}
        <nav className="mt-16 flex justify-between border-t pt-6 text-sm">
          {prevNext.prev ? (
            <Link href={`/learn/${prevNext.prev.slug}`} className="hover:underline">
              ← {prevNext.prev.title}
            </Link>
          ) : (
            <span />
          )}

          {prevNext.next ? (
            <Link href={`/learn/${prevNext.next.slug}`} className="hover:underline">
              {prevNext.next.title} →
            </Link>
          ) : (
            <span />
          )}
        </nav>

        {/* Related */}
        {related?.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl font-semibold mb-4">Related</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={`${r.source}-${r.slug}`}
                  href={`/learn/${r.slug}`}
                  className="block border rounded-2xl p-4 hover:shadow-md transition"
                >
                  {r.cover?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.cover.url}
                      alt={r.cover.alt || r.title}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                  ) : null}
                  <div className="text-xs uppercase tracking-wide text-neutral-500">
                    {r.source}
                  </div>
                  <div className="font-medium mt-1 line-clamp-2">{r.title}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="max-w-5xl mx-auto w-full px-4 md:px-6 mt-12">
        <Privacy />
      </div>
      <Footer />
    </div>
  );
}
