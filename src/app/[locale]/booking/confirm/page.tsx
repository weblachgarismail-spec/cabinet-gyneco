import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string; time?: string }>;
};

export default async function ConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { date, time } = await searchParams;
  const t = await getTranslations({ locale, namespace: "booking" });

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl" style={{ backgroundColor: "var(--color-primary-light)" }}>
        ✅
      </div>
      <h1 className="mb-4 text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("confirm_title")}
      </h1>
      <p className="mb-8 text-lg opacity-75">
        {t("confirm_msg", { date: date || "...", time: time || "..." })}
      </p>
      <Link
        href={locale === "fr" ? "/" : `/${locale}`}
        className="inline-block rounded-full px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        {t("confirm_back")}
      </Link>
    </div>
  );
}
