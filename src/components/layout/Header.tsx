"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { Link, usePathname } from "@/navigation";

type Props = { navLabels: Record<string, string> };

const publicKeys = ["home", "about", "services", "blog", "booking", "contact"] as const;

export function Header({ navLabels }: Props) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { data: session, status } = useSession();
  const t = useTranslations("admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const targetLocale = currentLocale === "fr" ? "ar" : "fr";
  const userRole = (session?.user as { role?: string })?.role || "";

  const isAdmin = pathname.includes("/admin/");

  const adminLinks = [
    { href: "/admin/appointments", label: t("appointments_title"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] },
    { href: "/admin/patients", label: t("patients_title"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] },
    { href: "/admin/profile", label: t("profile_nav"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] },
  ];
  if (userRole === "SUPER_ADMIN") {
    adminLinks.splice(2, 0, { href: "/admin/users", label: t("users_nav"), roles: ["SUPER_ADMIN"] });
    adminLinks.splice(3, 0, { href: "/admin/logs", label: t("logs_nav"), roles: ["SUPER_ADMIN"] });
    adminLinks.splice(4, 0, { href: "/admin/data", label: t("data_nav"), roles: ["SUPER_ADMIN"] });
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          Cabinet Gynécologique
        </Link>

        <nav className={`${mobileOpen ? "block" : "hidden"} md:flex md:items-center md:gap-4`}>
          {isAdmin ? (
            <>
              {status === "loading" ? null : (
                <>
                  {adminLinks.filter((l) => l.roles.includes(userRole)).map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-2 py-2 text-sm transition-colors hover:opacity-70"
                      style={{ color: "var(--color-text)" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => signOut({ callbackUrl: "/gestion" })}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#ef4444" }}
                  >
                    {t("logout")}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {publicKeys.map((key) => (
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
            </>
          )}
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
