// src/app/learn/[slug]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-24">
      <h1 className="text-2xl md:text-3xl font-semibold">Article not found</h1>
      <p className="mt-3 text-neutral-600">
        The article you’re looking for doesn’t exist or was moved.
      </p>
      <Link href="/learn" className="mt-6 inline-block text-emerald-600 hover:underline">
        ← Back to Learn
      </Link>
    </main>
  );
}
