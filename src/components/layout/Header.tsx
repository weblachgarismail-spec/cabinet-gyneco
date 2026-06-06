"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/navigation";

type Props = { locale: string; navLabels: Record<string, string> };

const navKeys = ["home", "about", "services", "blog", "booking", "contact"] as const;

export function Header({ navLabels }: Props) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const targetLocale = currentLocale === "fr" ? "ar" : "fr";

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          Cabinet Gynécologique
        </Link>

        <nav className={`${mobileOpen ? "block" : "hidden"} md:flex md:items-center md:gap-6`}>
          {navKeys.map((key) => (
            <Link
              key={key}
              href={key === "home" ? "/" : `/${key}`}
              className="block px-3 py-2 text-sm transition-colors hover:opacity-70"
              style={{ color: "var(--color-text)" }}
              onClick={() => setMobileOpen(false)}
            >
              {navLabels[key]}
            </Link>
          ))}
          <Link
            href={pathname}
            locale={targetLocale}
            className="block px-3 py-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: "var(--color-primary)" }}
            onClick={() => setMobileOpen(false)}
          >
            {navLabels.lang}
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
    </header>
  );
}
