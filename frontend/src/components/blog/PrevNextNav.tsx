// components/blog/PrevNextNav.tsx
import Link from "next/link";

export default function PrevNextNav({
  prev,
  next,
}: {
  prev: { slug: string; title: string } | null
  next: { slug: string; title: string } | null
}) {
  return (
    <div className="my-12 flex items-center justify-between">
      <div className="min-h-[40px]">
        {prev ? (
          <Link
            href={`/learn/${prev.slug}`}
            className="group flex items-center gap-2 text-sm text-neutral-700"
          >
            <span className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>{" "}
            Previous Article
          </Link>
        ) : <span />}
      </div>
      <div className="min-h-[40px]">
        {next ? (
          <Link
            href={`/learn/${next.slug}`}
            className="group flex items-center gap-2 text-sm text-neutral-700"
          >
            Next Article{" "}
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : <span />}
      </div>
    </div>
  )
}
