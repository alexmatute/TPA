// components/blog/Breadcrumbs.tsx
import Link from "next/link";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="text-sm text-neutral-500" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {it.href ? (
              <Link href={it.href} className="hover:text-neutral-700">
                {it.label}
              </Link>
            ) : (
              <span className="text-neutral-700">{it.label}</span>
            )}
            {i < items.length - 1 && <span>›</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
