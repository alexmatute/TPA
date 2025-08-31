type Props = {
  eyebrow?: string;   // línea pequeña arriba (opcional)
  title: string;      // “Blog”
  as?: keyof JSX.IntrinsicElements; // h1/h2...
  className?: string;
};

export default function SectionHeading({ eyebrow, title, as: Tag = "h1", className = "" }: Props) {
  return (
    <div className={`text-center mb-8 md:mb-10 ${className}`}>
      {eyebrow && <div className="text-sm md:text-base text-slate-500">{eyebrow}</div>}
      <div className="mx-auto mt-3 h-1 w-40 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
      <Tag className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
        {title}
      </Tag>
    </div>
  );
}
