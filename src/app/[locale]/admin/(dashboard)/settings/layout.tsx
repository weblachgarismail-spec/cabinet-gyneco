import { requireSuperAdmin } from "@/lib/admin-guard";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function SettingsLayout({ children, params }: Props) {
  const { locale } = await params;
  await requireSuperAdmin(locale);
  return <>{children}</>;
}
