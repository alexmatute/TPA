import s from "./style/Hero.module.scss";

type HeroACF = {
  hero_title?: string;
  hero_subtitle?: string;
  hero_primary_label?: string;
  hero_primary_url?: string;
  hero_secondary_label?: string;
  hero_secondary_url?: string;
  hero_bg_image?: string;
};

export default function Hero({ acf }: { acf?: HeroACF | null }) {
  const title = acf?.hero_title ?? "Build once, scale everywhere.";
  const subtitle = acf?.hero_subtitle ?? "Modern stack for content, growth and velocity.";

  const primary = {
    label: acf?.hero_primary_label ?? "Book a discovery call",
    href: acf?.hero_primary_url ?? "#",
  };
  const secondary = {
    label: acf?.hero_secondary_label ?? "Client login",
    href: acf?.hero_secondary_url ?? "#",
  };
  const bg = acf?.hero_bg_image || "";

  return (
    <section className={s.root}>
      {bg ? <div className={s.bg} style={{ backgroundImage: `url(${bg})` }} /> : null}

      <div className={s.container}>
        <h1 className={s.title}>{title}</h1>
        <p className={s.subtitle}>{subtitle}</p>

        <div className={s.ctas}>
          <a className={s.primary} href={primary.href}>{primary.label}</a>
          <a className={s.secondary} href={secondary.href}>{secondary.label}</a>
        </div>
      </div>
    </section>
  );
}
