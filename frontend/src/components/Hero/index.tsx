"use client";

type CTA = { label?: string; href?: string };
type HeroACF = {
  title?: string;
  subtitle?: string;
  primary?: CTA;
  secondary?: CTA;
  bgImageUrl?: string;
};

export default function Hero({ acf = {} as HeroACF }: { acf?: HeroACF }) {
  const bgStyle = acf.bgImageUrl
    ? { backgroundImage: `url(${acf.bgImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } as React.CSSProperties
    : undefined;

  // Fallbacks visuales para que SIEMPRE se vea algo
  const title = acf.title ?? "Build Smarter Digital Experiences";
  const subtitle =
    acf.subtitle ??
    "Empower your business with modern tools, seamless integrations, and scalable solutions.";

  return (
    <section className="bg-gray-50 py-20" style={bgStyle}>
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">{subtitle}</p>

        <div className="mt-8 flex justify-center gap-4">
          {(acf.primary?.label ?? "Book a discovery call") && (
            <a
              href={acf.primary?.href || "#"}
              className="rounded-md bg-[#00aa80] px-4 py-2 font-medium text-white hover:bg-[#009272]"
            >
              {acf.primary?.label ?? "Book a discovery call"}
            </a>
          )}

          {(acf.secondary?.label ?? "Try for free") && (
            <a
              href={acf.secondary?.href || "#"}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-100"
            >
              {acf.secondary?.label ?? "Try for free"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
