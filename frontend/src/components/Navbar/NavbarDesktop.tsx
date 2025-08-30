"use client";

import { useRef, useState } from "react";

import type { MenuItem } from "./types";
import styles from "./style/Navbar.module.scss";

export default function NavbarDesktop({ menu }: { menu: MenuItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const timersRef = useRef<Record<number, number | null>>({});

  const enter = (i: number) => {
    const t = timersRef.current[i];
    if (t) { clearTimeout(t); timersRef.current[i] = null; }
    setOpen(i);
  };
  const leave = (i: number) => {
    timersRef.current[i] = window.setTimeout(() => {
      setOpen((cur) => (cur === i ? null : cur));
    }, 160);
  };

  return (
    <nav className="hidden items-center gap-6 md:flex">
      {menu.map((group, idx) => {
        const hasChildren = !!group.children?.length;
        return (
          <div
            key={`${group.title}-${idx}`}
            className="relative"
            onMouseEnter={() => enter(idx)}
            onMouseLeave={() => leave(idx)}
            onFocus={() => enter(idx)}
            onBlur={() => leave(idx)}
          >
            <a
              href={group.url || "#"}
              className={`${styles.link} flex items-center gap-1`}
              aria-haspopup={hasChildren ? "menu" : undefined}
              aria-expanded={open === idx}
            >
              {group.title}
              {hasChildren && (
                <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5">
                  <path d="M5 7l5 5 5-5" fill="none" stroke="#00aa80" strokeWidth="2" />
                </svg>
              )}
            </a>

            {hasChildren && open === idx && (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className={`${styles.dropdown} w-56`}>
                  {group.children!.map((child, i) => (
                    <a
                      key={`${child.title}-${i}`}
                      href={child.url || "#"}
                      className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {child.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
