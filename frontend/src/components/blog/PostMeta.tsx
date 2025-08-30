// components/blog/PostMeta.tsx
export default function PostMeta({
  author,
  date,
}: {
  author?: { name?: string; title?: string; avatar?: string } | null
  date: string
}) {
  const d = new Date(date)
  const pretty = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  })

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden">
          {author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar} alt={author.name || "Author"} />
          ) : null}
        </div>
        <div className="text-sm">
          <div className="font-medium">{author?.name || "—"}</div>
          <div className="text-neutral-500">{author?.title || ""}</div>
        </div>
      </div>
      <div className="text-sm text-neutral-500">{pretty}</div>
    </div>
  )
}
