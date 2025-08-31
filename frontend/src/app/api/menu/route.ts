import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "main";
  const base = process.env.NEXT_PUBLIC_WP_BASE || "http://localhost:8080";

  try {
    const r = await fetch(`${base}/wp-json/site/v1/navigation/${slug}`, {
      cache: "no-store",
    });
    if (!r.ok) return NextResponse.json([], { status: 200 });

    const data = await r.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
