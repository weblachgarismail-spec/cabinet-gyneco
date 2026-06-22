"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { Link, usePathname } from "@/navigation";

const icons = {
  appointments: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="12" cy="15" r="1" /><circle cx="16" cy="15" r="1" /><circle cx="8" cy="15" r="1" />
    </svg>
  ),
  patients: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  stats: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

type LinkDef = { href: string; label: string; icon: React.ReactNode; disabled?: boolean };

type Props = {
  clinicName?: string;
  logoSvg?: React.ReactNode;
};

const defaultLogo = (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--color-primary)" }}>
    <path d="M12 3C8.5 3 6 5.5 6 9c0 1.5.5 3 1 4.5L8.5 20c.3.9 1 1.5 1.8 1.5h3.4c.8 0 1.5-.6 1.8-1.5l1.5-6.5c.5-1.5 1-3 1-4.5 0-3.5-2.5-6-6-6z"/>
  </svg>
);

export function AdminSidebar({ clinicName, logoSvg }: Props) {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { data: session, status } = useSession();
  const t = useTranslations("admin");
  const [open, setOpen] = useState(false);

  const userRole = (session?.user as { role?: string })?.role || "";
  const displayName = (session?.user as { displayName?: string })?.displayName || session?.user?.name || "";
  const isRtl = currentLocale === "ar";

  const sections: { title?: string; links: LinkDef[] }[] = [
    {
      links: [
        { href: "/admin/appointments", label: t("appointments_title"), icon: icons.appointments },
        { href: "/admin/patients", label: t("patients_title"), icon: icons.patients, disabled: true },
      ],
    },
    {
      links: [
        { href: "/admin/stats", label: t("stats_nav"), icon: icons.stats },
      ],
    },
  ];

  if (userRole === "SUPER_ADMIN") {
    sections.push({
      title: t("administration") || "Administration",
      links: [
        { href: "/admin/users", label: t("users_nav"), icon: icons.users },
        { href: "/admin/logs", label: t("logs_nav"), icon: icons.logs },
        { href: "/admin/data", label: t("data_nav"), icon: icons.data },
        { href: "/admin/settings", label: t("settings_nav"), icon: icons.settings },
      ],
    });
  }

  sections.push({
    links: [
      { href: "/admin/profile", label: t("profile_nav"), icon: icons.profile },
    ],
  });

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const sidebarContent = (
    <div className="flex h-full flex-col" style={{ color: "var(--color-text)" }}>
      <div className="flex items-center gap-2 border-b px-4 py-4" style={{ borderColor: "oklch(88% 0.01 190)" }}>
        {logoSvg ?? defaultLogo}
        <span className="text-sm font-semibold">{clinicName || "Cabinet"}</span>
      </div>

      <div className="flex items-center gap-2 border-b px-4 py-2.5 text-xs" style={{ borderColor: "oklch(88% 0.01 190)" }}>
        <span className="rounded-full px-2 py-0.5 font-medium text-white" style={{ backgroundColor: userRole === "SUPER_ADMIN" ? "#8b5cf6" : userRole === "SECRETARY" ? "#3b82f6" : "#10b981", fontSize: "0.625rem" }}>
          {userRole === "SUPER_ADMIN" ? t("role_super_admin") : userRole === "SECRETARY" ? t("role_secretary") : t("role_doctor")}
        </span>
        <span className="truncate opacity-60">{displayName}</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4 pt-4" : ""} style={si > 0 ? { borderTop: "1px solid oklch(88% 0.01 190)" } : undefined}>
            {section.title && (
              <p className="mb-1 px-2 text-[0.65rem] font-semibold uppercase tracking-wider opacity-40">{section.title}</p>
            )}
            {section.links.map((link) => {
              const active = isActive(link.href);
              if (link.disabled) {
                return (
                  <div
                    key={link.href}
                    className="flex cursor-not-allowed items-center gap-3 rounded-lg px-2 py-2 text-sm opacity-30"
                    title={t("feature_disabled")}
                  >
                    <span>{link.icon}</span>
                    <span>{link.label}</span>
                    <span className="ml-auto text-[0.6rem] uppercase tracking-wider opacity-60">{t("disabled")}</span>
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-all ${
                    active ? "font-medium" : "opacity-70 hover:opacity-100"
                  }`}
                  style={active ? { backgroundColor: "oklch(60% 0.12 190 / 0.12)", color: "var(--color-primary)" } : undefined}
                >
                  <span style={active ? { color: "var(--color-primary)" } : undefined}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t px-3 py-3" style={{ borderColor: "oklch(88% 0.01 190)" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/gestion" })}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-red-500 transition-all hover:bg-red-50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t("logout")}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 z-50 w-64 transform transition-transform duration-300 md:hidden ${isRtl ? "right-0" : "left-0"} ${open ? "translate-x-0" : isRtl ? "translate-x-full" : "-translate-x-full"}`}
        style={{ backgroundColor: "oklch(100% 0 0 / 0.98)", backdropFilter: "blur(16px)", borderRight: "1px solid oklch(88% 0.01 190)" }}>
        {sidebarContent}
      </aside>

      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r" style={{ borderColor: "oklch(88% 0.01 190)", backgroundColor: "oklch(98% 0.01 190 / 0.5)" }}>
        <div className="flex h-screen flex-col sticky top-0">{sidebarContent}</div>
      </aside>

      <button
        onClick={() => setOpen(!open)}
        className="fixed left-4 top-3 z-50 rounded-lg p-2 shadow-lg md:hidden"
        style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        aria-label="Menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
    </>
  );
}
