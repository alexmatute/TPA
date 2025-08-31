export type MenuItem = {
  title: string;
  url?: string;
  children?: MenuItem[];
};

export type NavGroupLocal = {
  label: string;
  items?: { label: string; href: string }[];
};
