import type { BlogPost } from "./types";
import { stripTags } from "./utils";

const EXTERNAL_API =
  process.env.NEXT_PUBLIC_EXTERNAL_API || "https://jsonplaceholder.typicode.com/posts";

export type ExtPost = { id: number; title: string; body: string };

/** ==== Generador de imágenes placeholder para posts externos ==== */
function generatePlaceholderImage(postId: number, title: string): string {
  // Usar Picsum para generar imágenes consistentes basadas en el ID del post
  const seed = postId;
  return `https://picsum.photos/seed/${seed}/800/600`;
}

/** ==== Helper para crear cover object ==== */
function createCoverForExternal(postId: number, title: string) {
  return {
    url: generatePlaceholderImage(postId, title),
    alt: `Imagen para: ${title}`,
  };
}

export async function listExternal(): Promise<BlogPost[]> {
  const res = await fetch(EXTERNAL_API, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  const data: ExtPost[] = await res.json();
  return data.slice(0, 50).map(p => ({
    id: String(p.id),
    slug: String(p.id), // IMPORTANT: external uses id as slug
    source: "ext",
    title: stripTags(p.title),
    excerpt: stripTags(p.body).slice(0, 160),
    content: `<p>${stripTags(p.body)}</p>`,
    date: null,
    cover: createCoverForExternal(p.id, p.title), // 🎯 Agregar imagen placeholder
    tags: ["external"],
  }));
}

export async function getExternalBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${EXTERNAL_API}/${slug}`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const p: ExtPost = await res.json();
  if (!p?.id) return null;
  return {
    id: String(p.id),
    slug: String(p.id),
    source: "ext",
    title: stripTags(p.title),
    excerpt: stripTags(p.body).slice(0, 160),
    content: `<p>${stripTags(p.body)}</p>`,
    date: null,
    cover: createCoverForExternal(p.id, p.title), // 🎯 Agregar imagen placeholder
    tags: ["external"],
  };
}

/** ==== Función adicional para obtener cards con imágenes ==== */
export async function fetchExternalCards(limit: number = 10) {
  const posts = await listExternal();
  return posts.slice(0, limit).map(post => ({
    id: parseInt(post.id),
    href: `/learn/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt,
    imageUrl: post.cover?.url,
    imageAlt: post.cover?.alt,
  }));
}

/** ==== Helper para debug ==== */
export async function debugExternalPosts() {
  try {
    const posts = await listExternal();
    console.log('🔍 External posts debug:', posts.slice(0, 3).map(p => ({
      id: p.id,
      title: p.title,
      coverUrl: p.cover?.url,
      coverAlt: p.cover?.alt,
    })));
    return posts;
  } catch (error) {
    console.error('❌ Error debugging external posts:', error);
    return [];
  }
}