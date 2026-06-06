import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(locale === "fr" ? "/admin/login" : `/${locale}/admin/login`);
  }

  const t = await getTranslations({ locale, namespace: "admin" });
  const role = (session?.user as { role?: string })?.role || "";
  const themeColor = (session?.user as { themeColor?: string })?.themeColor || "#8B5CF6";

  const links: { href: string; label: string; roles: string[] }[] = [
    { href: `/${locale}/admin/appointments`, label: t("appointments_title"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] },
    { href: `/${locale}/admin/patients`, label: t("patients_title"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] },
  ];
  if (role === "SUPER_ADMIN") {
    links.push({ href: `/${locale}/admin/users`, label: t("users_nav"), roles: ["SUPER_ADMIN"] });
    links.push({ href: `/${locale}/admin/logs`, label: t("logs_nav"), roles: ["SUPER_ADMIN"] });
    links.push({ href: `/${locale}/admin/data`, label: t("data_nav"), roles: ["SUPER_ADMIN"] });
  }
  links.push({ href: `/${locale}/admin/profile`, label: t("profile_nav"), roles: ["SUPER_ADMIN", "SECRETARY", "DOCTOR"] });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" style={{ "--theme-color": themeColor } as React.CSSProperties}>
      {session && (
        <nav className="mb-8 flex flex-wrap gap-4 border-b pb-4" style={{ borderColor: "#e5e7eb" }}>
          {links.filter((link) => link.roles.includes(role)).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
            >
              {link.label}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-3 self-center text-xs opacity-50">
            {role === "SUPER_ADMIN" ? t("role_super_admin") : role === "SECRETARY" ? t("role_secretary") : t("role_doctor")} — {session.user?.name}
            <LogoutButton />
          </span>
        </nav>
      )}
      {children}
    </div>
  );
}
