import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("legal_title"),
    alternates: { canonical: `/${locale}/legal` },
  };
}

export default async function LegalPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("title")}</h1>
      <div className="space-y-6 text-sm leading-relaxed opacity-80">
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("editor_title")}</h2>
          <p>{t("editor_name")}<br />{t("editor_address")}<br />{t("editor_phone")}<br />{t("editor_email")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("host_title")}</h2>
          <p>{t("host_name")}<br />{t("host_address")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("property_title")}</h2>
          <p>{t("property_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("cookies_title")}</h2>
          <p>{t("cookies_text")}</p>
        </section>
      </div>
    </div>
  );
}
