import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "home";
  const base = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";

  try {
    // 1) Trae la página por slug; si ACF está expuesto en el Field Group, vendrá en "acf"
    const url = `${base}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,acf`;
    const r1 = await fetch(url, { cache: "no-store" });
    if (!r1.ok) return NextResponse.json(null);

    const arr = await r1.json();
    const page = arr?.[0] || null;
    if (!page) return NextResponse.json(null);

    // 2) Fallback: si no vino "acf", intenta con ACF to REST API
    if (!page.acf) {
      const r2 = await fetch(`${base}/wp-json/acf/v3/pages/${page.id}`, { cache: "no-store" });
      if (r2.ok) {
        const j2 = await r2.json();
        page.acf = j2?.acf || null;
      }
    }

    return NextResponse.json(page);
  } catch {
    return NextResponse.json(null, { status: 200 });
  }
}
