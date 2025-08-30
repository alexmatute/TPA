"use client";

import s from "./style/Privacy.module.scss";
import { useState } from "react";

type Link = { label: string; href: string };

type Props = {
  title?: string;
  placeholder?: string;
  submitLabel?: string;
  links?: Link[];
  copyright?: string;
};

export default function Privacy({
  title = "Torem ipsum dolor sit amet, consectetur adipiscing elit.",
  placeholder = "Email",
  submitLabel = "Submit",
  links = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
  copyright = `Copyright © ${new Date().getFullYear()} Gorem ipsum dolor sit amet elit.`,
}: Props) {
  const [value, setValue] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Aquí puedes integrar tu endpoint real (por ejemplo /api/newsletter)
    // fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email: value }) })
    //   .then(() => setValue(""));
    alert(`Submitted: ${value}`);
    setValue("");
  }

  return (
    <section className={s.root} role="contentinfo" aria-label="Privacy and newsletter">
      <div className={s.container}>
        {/* Columna izquierda: título + form */}
        <div className={s.left}>
          <h3 className={s.title}>{title}</h3>

          <form className={s.form} onSubmit={onSubmit}>
            <label htmlFor="newsletter-email" className={s.srOnly}>
              Email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={s.input}
            />
            <button type="submit" className={s.submit}>
              {submitLabel}
            </button>
          </form>
        </div>

        {/* Columna derecha: links + copyright */}
        <div className={s.right}>
          <nav className={s.links} aria-label="Legal links">
            {links.map((l) => (
              <a key={l.label} href={l.href} className={s.link}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className={s.copy}>{copyright}</div>
        </div>
      </div>
    </section>
  );
}
