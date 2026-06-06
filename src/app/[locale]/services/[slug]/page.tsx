import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type ServiceItem = { title: string; desc: string; slug: string; img: string };

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  const items = t.raw("items") as ServiceItem[];
  const service = items.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href={`/${locale}/services`} className="mb-6 inline-block opacity-70 hover:opacity-100">
        {t("detail_back")}
      </Link>

      <div className="overflow-hidden rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
        <div style={{ backgroundColor: "var(--color-primary-light)" }}>
          <img src={service.img.replace("w=400", "w=800")} alt={service.title} loading="lazy" className="h-64 w-full object-cover" />
        </div>
        <div className="p-8">
          <h1 className="mb-6 text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
            {t("detail_title", { title: service.title })}
          </h1>
          <p className="mb-6 text-lg leading-relaxed">{service.desc}</p>
          <p className="leading-relaxed opacity-85">{t("detail_desc", { titleLower: service.title.toLowerCase() })}</p>
        </div>
      </div>
    </div>
  );
}
