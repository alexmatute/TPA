"use client";

import { useEffect, useState } from "react";

import type { MenuItem } from "./types";
import styles from "./style/Navbar.module.scss";

type Props = {
  menu: MenuItem[];
  loginHref: string;
  loginLabel: string;
  ctaHref: string;
  ctaLabel: string;
};

export default function NavbarMobile({
  menu,
  loginHref,
  loginLabel,
  ctaHref,
  ctaLabel,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAcc, setMobileAcc] = useState<Record<number, boolean>>({});

  // Bloquea el scroll del body cuando el panel está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  const toggleAcc = (idx: number) =>
    setMobileAcc((p) => ({ ...p, [idx]: !p[idx] }));

  return (
    <>
      {/* Botón hamburger */}
      <button
        aria-label="Open menu"
        className="md:hidden rounded-md p-2"
        onClick={() => setMobileOpen(true)}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M3 6h18M3 12h18M3 18h18" stroke="#000" strokeWidth="2" />
        </svg>
      </button>

      {/* Overlay + Panel lateral */}
      {mobileOpen && (

  <div
    className="fixed inset-0 z-[70] md:hidden"   // contenedor del modal
    onClick={() => setMobileOpen(false)}
    role="dialog"
    aria-modal="true"
    // Crea un stacking context para cortar filtros del fondo (iOS/Safari)
    style={{ isolation: "isolate" }}
  >
    {/* overlay oscuro */}
    <div className="absolute inset-0 bg-black/60" />

    {/* panel blanco por encima del overlay */}
    <div
      className={`${styles.panel} absolute right-0 top-0 h-full w-80 translate-x-0
                  bg-white p-6 transition-transform z-[80] shadow-2xl ring-1 ring-black/10`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header del panel */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold">Menu</span>
        <button
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M6 6l12 12M18 6l-12 12"
              stroke="#000"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

            {/* Navegación */}
            <nav className="space-y-2" aria-label="Mobile">
              {menu.map((group, idx) => {
                const hasChildren = !!group.children?.length;
                const isOpen = !!mobileAcc[idx];

                return (
                  <div key={`${group.title}-${idx}`} className="border-b pb-2">
                    <button
                      className="flex w-full items-center justify-between py-2 text-left text-gray-900"
                      aria-expanded={isOpen}
                      aria-controls={`nav-acc-${idx}`}
                      onClick={() => {
                        if (hasChildren) return toggleAcc(idx);
                        if (group.url) window.location.href = group.url;
                      }}
                    >
                      <span>{group.title}</span>
                      {hasChildren && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 20 20"
                          className={`transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                          aria-hidden
                        >
                          <path
                            d="M5 7l5 5 5-5"
                            fill="none"
                            stroke="#000"
                            strokeWidth="2"
                          />
                        </svg>
                      )}
                    </button>

                    {hasChildren && isOpen && (
                      <div id={`nav-acc-${idx}`} className="ml-2 space-y-1 pb-2">
                        {group.children!.map((child, i) => (
                          <a
                            key={`${child.title}-${i}`}
                            href={child.url || "#"}
                            className="block rounded-md px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Acciones */}
            <div className="mt-6 space-y-3">
              <a
                href={loginHref}
                className="block rounded-md border px-4 py-2 text-center font-medium text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {loginLabel}
              </a>
              <a
                href={ctaHref}
                className="block rounded-md bg-[#00aa80] px-4 py-2 text-center font-semibold text-white hover:bg-[#009272]"
                onClick={() => setMobileOpen(false)}
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
