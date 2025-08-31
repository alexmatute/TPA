
// Re-export explícito con extensión para evitar problemas de resolución
export { default as FeaturedCarouselServer } from "./Server.tsx";
export type { FeaturedItem } from "./Client";

// Export por defecto para poder importar:  import FeaturedCarousel from "@/components/FeaturedCarousel";
export { default } from "./Server.tsx";
