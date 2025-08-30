// src/app/learn/SearchBar.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBar({
  initialQuery,
  initialSort,
  basePath = "/learn",
}: {
  initialQuery: string;
  initialSort: string;
  basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery || "");
  const [sort, setSort] = useState(initialSort || "newest");

  useEffect(() => {
    setQ(initialQuery || "");
    setSort(initialSort || "newest");
  }, [initialQuery, initialSort]);

  const submit = useCallback(
    (newQ: string, newSort: string) => {
      const sp = new URLSearchParams(params?.toString());
      if (newQ) sp.set("q", newQ);
      else sp.delete("q");
      if (newSort) sp.set("sort", newSort);
      else sp.delete("sort");
      sp.set("page", "1");
      router.push(`${basePath}?${sp.toString()}`);
    },
    [params, router, basePath]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit(q, sort)}
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
          value={sort}
          onChange={(e) => {
            const v = e.target.value;
            setSort(v);
            submit(q, v);
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title-az">Title (A–Z)</option>
        </select>
        <button
          onClick={() => submit(q, sort)}
          className="ml-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
