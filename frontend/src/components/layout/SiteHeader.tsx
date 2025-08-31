// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-6 w-6 rounded-sm bg-emerald-500 inline-block" />
          <span className="font-semibold">TPA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/solutions">Solutions</Link>
          <Link href="/company">Company</Link>
          <Link href="/resources">Resources</Link>
          <Link href="/learn">Learn</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-xs rounded-md border px-3 py-1.5"
          >
            Client Login
          </Link>
          <Link
            href="/book"
            className="text-xs rounded-md bg-emerald-500 px-3 py-1.5 text-white"
          >
            Book A Discovery Call
          </Link>
        </div>
      </div>
    </header>
  );
}
