import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ToastProvider } from "@/components/ui/Toast";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(locale === "fr" ? "/gestion" : `/${locale}/gestion`);
  }

  const crossSvg = (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--color-primary)" }}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  return (
    <ToastProvider>
    <div className="flex min-h-screen">
      <AdminSidebar clinicName="Cabinet Gynécologique" logoSvg={crossSvg} />
      <main className="flex-1 overflow-x-auto px-4 py-8 md:px-8">{children}</main>
    </div>
    </ToastProvider>
  );
}
