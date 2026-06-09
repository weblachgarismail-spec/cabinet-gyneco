import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ToastProvider } from "@/components/ui/Toast";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(locale === "fr" ? "/gestion" : `/${locale}/gestion`);
  }

  const t = await getTranslations({ locale, namespace: "admin" });
  const role = (session?.user as { role?: string })?.role || "";
  const themeColor = (session?.user as { themeColor?: string })?.themeColor || "#8B5CF6";
  const displayName = (session?.user as { displayName?: string })?.displayName || session.user?.name || "";

  return (
    <ToastProvider>
    <div className="mx-auto max-w-7xl px-4 py-8" style={{ "--theme-color": themeColor } as React.CSSProperties}>
      {session && (
        <div className="mb-6 flex items-center justify-end gap-3 border-b pb-3 text-xs opacity-50" style={{ borderColor: "#e5e7eb" }}>
          <span>{role === "SUPER_ADMIN" ? t("role_super_admin") : role === "SECRETARY" ? t("role_secretary") : t("role_doctor")} — {displayName}</span>
          <span className="text-gray-300">|</span>
          <a href={`/${locale}/admin/profile`} className="underline transition-opacity hover:opacity-80">{t("profile_nav")}</a>
        </div>
      )}
      {children}
    </div>
    </ToastProvider>
  );
}
