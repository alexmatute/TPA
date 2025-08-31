// src/components/FeaturedCarousel/Server.tsx
import FeaturedCarouselClient, { FeaturedItem } from "./Client";
import {
  WpPostLite,
  fetchFeaturedAcrossTypes,
  fetchHomeACF,
  fetchPostsByIdsMixed,
  normalizeIds,
  toCard,
} from "@/lib/wp";

export default async function FeaturedCarouselServer() {
  // ACF de la Home
  const page = await fetchHomeACF("home").catch(() => null);
  const acf = page?.acf ?? null;

  // 1) Relación manual ACF (puede mezclar post + case-study)
  const ids = normalizeIds(acf?.featured_posts ?? []);

  let posts: WpPostLite[] = [];

  if (ids.length) {
    // Mezcla case-study y post, conserva el orden del Relationship
    posts = await fetchPostsByIdsMixed(ids, ["case-study", "post"], 60);
  } else {
    // 2) Fallback: “featured” combinando tipos (sticky / tag / category)
    posts = await fetchFeaturedAcrossTypes({
      types: ["case-study", "post"],
      limit: 8,
      via: "sticky",        // puedes usar "tag" o "category"
      tagSlug: "featured",
      category: "featured",
      revalidate: 60,
    });
  }

  if (!posts.length) return null;

  // Mapea al shape que espera el cliente
  const items: FeaturedItem[] = posts.map((p) => {
    const c = toCard(p);
    return {
      id: c.id,
      href: c.href,
      title: c.title,
      excerpt: c.excerpt,
      imageUrl: c.imageUrl || "",
      imageAlt: c.imageAlt || "",
    };
  });

  return (
    <FeaturedCarouselClient
      eyebrow={acf?.featured_eyebrow ?? "Featured"}
      heading={acf?.featured_heading ?? "Highlights"}
      items={items}
    />
  );
}
