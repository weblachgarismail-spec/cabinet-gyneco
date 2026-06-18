"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, usePathname } from "@/navigation";

type Props = { navLabels: Record<string, string> };

const publicKeys = ["home", "about", "services", "blog", "booking", "contact"] as const;

export function Header({ navLabels }: Props) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const targetLocale = currentLocale === "fr" ? "ar" : "fr";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin = pathname.includes("/admin/");

  if (isAdmin) {
    return (
      <header className={`glass sticky top-0 z-50 transition-all duration-300 md:hidden ${scrolled ? "shadow-sm" : ""}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }}>
            <span className="hidden sm:inline">Cabinet Gynécologique</span>
            <span className="sm:hidden">Cabinet</span>
          </Link>
          <div className="md:hidden" />
        </div>
      </header>
    );
  }

  return (
    <header className={`glass sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold transition-opacity hover:opacity-80" style={{ color: "var(--color-primary)" }}>
          <span className="hidden sm:inline">Cabinet Gynécologique</span>
          <span className="sm:hidden">Cabinet</span>
        </Link>

        <nav className={`${mobileOpen ? "block" : "hidden"} absolute left-0 right-0 top-full z-50 border-t p-4 shadow-lg md:static md:flex md:items-center md:gap-1 md:border-none md:p-0 md:shadow-none`}
          style={{ backgroundColor: "oklch(100% 0 0 / 0.95)", backdropFilter: "blur(12px)" }}>
          {publicKeys.map((key) => (
            <Link
              key={key}
              href={key === "home" ? "/" : `/${key}`}
              className="block rounded-lg px-3 py-2 text-sm transition-all hover:opacity-80 md:px-2 md:py-1.5"
              style={{ color: "var(--color-text)" }}
              onClick={() => setMobileOpen(false)}
            >
              {navLabels[key]}
            </Link>
          ))}
          <Link
            href={pathname}
            locale={targetLocale}
            className="mt-1 block rounded-lg px-3 py-2 text-sm font-medium transition-all hover:opacity-80 md:ml-1 md:mt-0"
            style={{ color: "var(--color-primary)" }}
            onClick={() => setMobileOpen(false)}
          >
            {navLabels.lang}
          </Link>
        </nav>

        <button className="relative z-50 md:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
    </header>
  );
}
