import { getTranslations } from "next-intl/server";

type Props = { locale: string };

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="py-8 text-center text-sm" style={{ backgroundColor: "var(--color-primary-dark)", color: "#fff" }}>
      <p>{t("rights")}</p>
      <p className="mt-2 font-semibold">{t("emergency")}</p>
    </footer>
  );
}
