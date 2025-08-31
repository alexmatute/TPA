"use client";

import { useEffect, useRef, useState } from "react";
import { ctas, nav as localNav } from "../../data/site";
import { getMenuFromNavigation, type MenuItem } from "../../lib/api";

// Mapea el menú local (label/items) a la estructura MenuItem (title/children)
type NavGroupLocal = { label: string; items?: { label: string; href: string }[] };
const mapLocalToMenu = (data: NavGroupLocal[]): MenuItem[] =>
  data.map((g) => ({
    title: g.label,
    url: "",
    children: (g.items || []).map((i) => ({ title: i.label, url: i.href, children: [] })),
  }));

export default function Navbar() {
  // Arranca con el menú local para que siempre se vea algo
  const [menu, setMenu] = useState<MenuItem[]>(mapLocalToMenu(localNav));

  // Estado UI
  const [open, setOpen] = useState<number | null>(null);   // dropdown desktop abierto
  const [mobileOpen, setMobileOpen] = useState(false);     // panel móvil
  const [mobileAcc, setMobileAcc] = useState<Record<number, boolean>>({}); // acordeones móviles

  // Timers para cerrar con delay (un solo ref compartido para todos los items)
  const timersRef = useRef<Record<number, number | null>>({});

  // Cargar menú desde WP vía proxy interno (sin CORS) y reemplazar si trae algo
  useEffect(() => {
    getMenuFromNavigation("main")
      .then((wpMenu) => {
        if (Array.isArray(wpMenu) && wpMenu.length >= 1) setMenu(wpMenu);
      })
      .catch(() => {
        // nos quedamos con el local
      });
  }, []);

  // Bloquear scroll del body cuando el panel móvil está abierto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [mobileOpen]);

  const toggleAcc = (i: number) => setMobileAcc((p) => ({ ...p, [i]: !p[i] }));

  // Handlers con pequeño delay para permitir mover el mouse al panel
  const handleEnter = (idx: number) => {
    const t = timersRef.current[idx];
    if (t) {
      clearTimeout(t);
      timersRef.current[idx] = null;
    }
    setOpen(idx);
  };

  const handleLeave = (idx: number) => {
    timersRef.current[idx] = window.setTimeout(() => {
      setOpen((current) => (current === idx ? null : current));
    }, 160);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white md:bg-white/90 md:backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* IZQUIERDA: logo + menú (desktop) */}
        <div className="flex items-center gap-4 md:gap-6">
          <a href="/" className="flex items-center">
            <img src="/logo_transparent@4x.png" alt="Brand" className="h-8 w-auto" />
          </a>

          {/* Menú desktop pegado al logo */}
          <nav className="hidden items-center gap-6 md:flex">
            {menu.map((group, idx) => {
              const hasChildren = !!group.children?.length;

              return (
                <div
                  key={`${group.title}-${idx}`}
                  className="relative"
                  onMouseEnter={() => handleEnter(idx)}
                  onMouseLeave={() => handleLeave(idx)}
                  onFocus={() => handleEnter(idx)}
                  onBlur={() => handleLeave(idx)}
                >
                  <a
                    href={group.url || "#"}
                    className="flex items-center gap-1 text-gray-700 hover:text-black"
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

                  {/* Wrapper con pt-2 (SIN hueco) para que no se cierre al bajar */}
                  {hasChildren && open === idx && (
                    <div className="absolute left-0 top-full z-50 pt-2">
                      <div className="w-56 rounded-lg border bg-white p-2 shadow-lg">
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
        </div>

        {/* DERECHA: acciones desktop */}
        <div className="hidden items-center gap-4 md:flex">
          <a href={ctas.login.href} className="text-gray-700 hover:text-black">
            {ctas.login.label}
          </a>
          <a
            href={ctas.primary.href}
            className="rounded-md bg-[#00aa80] px-4 py-2 font-medium text-white hover:bg-[#009272]"
          >
            {ctas.primary.label}
          </a>
        </div>

        {/* Hamburger (mobile) */}
        <button
          aria-label="Open menu"
          className="md:hidden rounded-md p-2"
          onClick={() => setMobileOpen(true)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M3 12h18M3 18h18" stroke="#000" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* OVERLAY + PANEL MÓVIL */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="absolute right-0 top-0 h-full w-80 translate-x-0 bg-white p-6 shadow-2xl ring-1 ring-black/10 transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-semibold">Menu</span>
              <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="rounded-md p-1">
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path d="M6 6l12 12M18 6l-12 12" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="space-y-2">
              {menu.map((group, idx) => {
                const hasChildren = !!group.children?.length;
                const openAcc = !!mobileAcc[idx];

                return (
                  <div key={`${group.title}-${idx}`} className="border-b pb-2">
                    <button
                      className="flex w-full items-center justify-between py-2 text-left text-gray-900"
                      onClick={() => {
                        if (hasChildren) return setMobileAcc((p) => ({ ...p, [idx]: !p[idx] }));
                        if (group.url) window.location.href = group.url;
                      }}
                    >
                      <span>{group.title}</span>
                      {hasChildren && (
                        <svg width="14" height="14" viewBox="0 0 20 20" className={`transition-transform ${openAcc ? "rotate-180" : ""}`}>
                          <path d="M5 7l5 5 5-5" fill="none" stroke="#000" strokeWidth="2" />
                        </svg>
                      )}
                    </button>

                    {hasChildren && openAcc && (
                      <div className="ml-2 space-y-1 pb-2">
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

            <div className="mt-6 space-y-3">
              <a
                href={ctas.login.href}
                className="block rounded-md border px-4 py-2 text-center font-medium text-gray-900 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                {ctas.login.label}
              </a>
              <a
                href={ctas.primary.href}
                className="block rounded-md bg-[#00aa80] px-4 py-2 text-center font-semibold text-white hover:bg-[#009272]"
                onClick={() => setMobileOpen(false)}
              >
                {ctas.primary.label}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
