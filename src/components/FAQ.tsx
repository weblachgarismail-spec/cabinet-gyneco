"use client";

import { useState } from "react";

type FaqItem = { question: string; answer: string };

export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="overflow-hidden rounded-xl border transition-all" style={{ borderColor: open === i ? "var(--color-primary)" : "oklch(88% 0.01 355)" }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: "var(--color-primary-dark)" }}
          >
            <span>{item.question}</span>
            <svg className={`h-4 w-4 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96" : "max-h-0"}`}>
            <div className="border-t px-5 py-4 text-sm leading-relaxed opacity-70" style={{ borderColor: "oklch(88% 0.01 355)" }}>
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
