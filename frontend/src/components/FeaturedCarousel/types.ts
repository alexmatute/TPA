export type FeaturedItem = {
  id: number;
  title: string;
  excerpt?: string;
  image?: { url: string; alt?: string };
  href: string;
};
