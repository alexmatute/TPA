// src/lib/api.ts
import { fetchMenuServer, type WpMenuItem } from "./wp";

export type MenuItem = {
  title: string;
  href: string;
  children?: MenuItem[];
};

function mapWpToMenuItem(it: WpMenuItem): MenuItem {
  const href = (it.url || "").toString() || "#";
  return {
    title: (it.title || "").toString(),
    href,
    children: Array.isArray(it.children) ? it.children.map(mapWpToMenuItem) : [],
  };
}

/** Compat para el Navbar existente */
export async function getMenuFromNavigation(locationOrId: string = "main"): Promise<MenuItem[]> {
  const items = await fetchMenuServer(locationOrId);
  return (items || []).map(mapWpToMenuItem);
}

export { fetchMenuServer } from "./wp";
