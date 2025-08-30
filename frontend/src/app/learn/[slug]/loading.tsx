// app/learn/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20">
      <div className="h-6 w-40 bg-neutral-100 rounded" />
      <div className="mt-4 h-8 w-2/3 bg-neutral-100 rounded" />
      <div className="mt-8 aspect-[16/9] w-full bg-neutral-100 rounded-2xl" />
      <div className="mt-10 space-y-3">
        <div className="h-4 w-full bg-neutral-100 rounded" />
        <div className="h-4 w-5/6 bg-neutral-100 rounded" />
        <div className="h-4 w-4/6 bg-neutral-100 rounded" />
      </div>
    </div>
  )
}
