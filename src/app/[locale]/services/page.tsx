import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { Metadata } from "next";

type ServiceItem = { title: string; desc: string; slug: string; img: string };

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("services_title"),
    description: t("services_desc"),
    alternates: { canonical: `/${locale}/services` },
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-16">
      <div className="anim-float absolute -left-8 top-40 text-[100px] opacity-5">✚</div>
      <div className="anim-float absolute -right-8 bottom-20 text-[140px] opacity-5" style={{ animationDelay: "2.5s" }}>✚</div>

      <h1 className="anim-fade-in-up mb-12 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("title")}
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(t.raw("items") as ServiceItem[]).map((item, i) => (
          <Link key={i} href={`/${locale}/services/${item.slug}`} className={`anim-fade-in-up anim-delay-${(i % 4) + 1} group block overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`} style={{ backgroundColor: "#fff" }}>
            <div className="h-40 overflow-hidden" style={{ backgroundColor: "var(--color-primary-light)" }}>
              <img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <div className="p-5">
              <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
                {item.title}
              </h2>
              <p className="leading-relaxed opacity-85">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
