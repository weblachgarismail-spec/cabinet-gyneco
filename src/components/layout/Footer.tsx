import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { locale: string };

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="py-8 text-center text-sm" style={{ backgroundColor: "var(--color-primary-dark)", color: "#fff" }}>
      <div className="mx-auto mb-4 flex max-w-md justify-center gap-6">
        <Link href="/legal" className="underline opacity-80 hover:opacity-100">{t("legal")}</Link>
        <Link href="/privacy" className="underline opacity-80 hover:opacity-100">{t("privacy")}</Link>
      </div>
      <p>{t("rights")}</p>
      <p className="mt-2 font-semibold">{t("emergency")}</p>
    </footer>
  );
}
