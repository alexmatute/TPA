// components/blog/RelatedGrid.tsx
import Link from "next/link";

type Card = {
  slug: string
  title: string
  excerpt: string
  cover: string | null
}

export default function RelatedGrid({ items }: { items: Card[] }) {
  return (
    <section className="mt-16">
      <h3 className="text-2xl font-semibold mb-6">Related Articles</h3>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <article
            key={it.slug}
            className="rounded-2xl border bg-gradient-to-br from-white to-neutral-50 shadow-sm p-4"
          >
            <div className="aspect-[16/10] overflow-hidden rounded-xl border bg-white">
              {it.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.cover}
                  alt={it.title}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <h4 className="mt-4 font-semibold">{it.title}</h4>
            <p className="mt-2 text-sm text-neutral-600 line-clamp-3">
              {it.excerpt}
            </p>
            <Link
              href={`/learn/${it.slug}`}
              className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-600"
            >
              Read Case Study <span>→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
