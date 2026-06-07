import { getTranslations } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("title")}</h1>
      <p className="mb-8 text-sm opacity-50">{t("updated")}</p>
      <div className="space-y-6 text-sm leading-relaxed opacity-80">
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("controller_title")}</h2>
          <p>{t("controller_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("data_title")}</h2>
          <p>{t("data_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("purpose_title")}</h2>
          <p>{t("purpose_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("retention_title")}</h2>
          <p>{t("retention_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("rights_title")}</h2>
          <p>{t("rights_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("security_title")}</h2>
          <p>{t("security_text")}</p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("contact_title")}</h2>
          <p>{t("contact_text")}</p>
        </section>
      </div>
    </div>
  );
}
