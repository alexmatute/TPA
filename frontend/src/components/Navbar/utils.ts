import type { MenuItem, NavGroupLocal } from "./types";

export const mapLocalToMenu = (data: NavGroupLocal[]): MenuItem[] =>
  data.map((g) => ({
    title: g.label,
    url: "",
    children: (g.items || []).map((i) => ({ title: i.label, url: i.href, children: [] })),
  }));
