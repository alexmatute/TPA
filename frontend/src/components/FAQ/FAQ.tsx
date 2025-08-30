"use client";

import s from "./style/FAQ.module.scss";
import { useState } from "react";

export type FaqItem = { question: string; answer: string };

export default function FAQ({ faqs = [] as FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
   <section className="bg-white py-16 md:py-24">
      <div className={s.container}>
        <h2 className={s.heading}>Frecuente Asked Questions</h2>
        <div className={s.list}>
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className={s.item}>
                <button
                  className={s.q}
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  {f.question}
                  <span className={`${s.chev} ${isOpen ? s.rotate : ""}`} aria-hidden>
                    ▾
                  </span>
                </button>
                {isOpen && <div className={s.a} dangerouslySetInnerHTML={{ __html: f.answer }} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
