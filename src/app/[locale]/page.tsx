import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

type ServiceItem = { title: string; desc: string; slug: string; img: string };

type FeatureItem = { title: string; desc: string; img: string };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tServices = await getTranslations({ locale, namespace: "services" });

  return (
    <div>
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 text-center" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&q=80" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.88), rgba(255,255,255,0.65))" }} />
        <div className="anim-float absolute -right-16 -top-16 text-[200px] opacity-[0.07] text-white">✚</div>
        <div className="anim-float absolute -bottom-20 -left-20 text-[250px] opacity-[0.07] text-white" style={{ animationDelay: "2s" }}>✚</div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="anim-fade-in-up mb-4 text-4xl font-bold md:text-5xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("title")}
          </h1>
          <p className="anim-fade-in-up anim-delay-1 mb-3 text-xl">{t("subtitle")}</p>
          <p className="anim-fade-in-up anim-delay-2 mb-8 text-lg leading-relaxed opacity-80">{t("description")}</p>
          <div className="anim-fade-in-up anim-delay-3 flex flex-wrap justify-center gap-4">
            <Link
              href={locale === "fr" ? "/booking" : `/${locale}/booking`}
              className="rounded-full px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t("cta_booking")}
            </Link>
            <Link
              href={locale === "fr" ? "/contact" : `/${locale}/contact`}
              className="rounded-full border-2 px-8 py-3 font-semibold transition-transform hover:scale-105"
              style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)" }}
            >
              {t("cta_contact")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="anim-fade-in-up mb-10 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
          {t("features_title")}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {(t.raw("features") as FeatureItem[]).map((f, i) => (
            <div key={i} className={`anim-fade-in-up anim-delay-${i + 1} group overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-2 hover:shadow-lg`} style={{ backgroundColor: "#fff" }}>
              <div className="h-48 overflow-hidden" style={{ backgroundColor: "var(--color-primary-light)" }}>
                <img src={f.img} alt={f.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="mb-3 text-xl font-semibold" style={{ color: "var(--color-primary-dark)" }}>{f.title}</h3>
                <p className="leading-relaxed opacity-85">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {(t.raw("stats") as Array<{ value: string; label: string }>).map((s, i) => (
              <div key={i} className="anim-fade-in-up text-center" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-4xl font-bold md:text-5xl" style={{ color: "var(--color-primary-dark)" }}>
                  {s.value}
                </div>
                <div className="mt-2 opacity-70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="anim-fade-in-up mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
            {t("services_title")}
          </h2>
          <p className="mx-auto max-w-xl leading-relaxed opacity-75">{t("services_desc")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {(tServices.raw("items") as ServiceItem[]).slice(0, 3).map((item, i) => (
            <Link key={item.slug} href={`/${locale}/services/${item.slug}`} className={`anim-fade-in-up anim-delay-${i + 1} group block overflow-hidden rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md`} style={{ backgroundColor: "#fff" }}>
              <div className="h-40 overflow-hidden" style={{ backgroundColor: "var(--color-primary-light)" }}>
                <img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="mb-2 font-semibold" style={{ color: "var(--color-primary)" }}>
                  {item.title}
                </h3>
                <p className="leading-relaxed opacity-85">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="anim-fade-in-up mt-8 text-center">
          <Link href={`/${locale}/services`} className="inline-block rounded-full px-6 py-2 font-medium transition-transform hover:scale-105" style={{ border: "2px solid var(--color-primary)", color: "var(--color-primary)" }}>
            {locale === "fr" ? "Voir tous nos services →" : "عرض جميع الخدمات ←"}
          </Link>
        </div>
      </section>

      <section className="relative px-4 py-20 text-center" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
        <div className="anim-float absolute -right-10 -top-10 text-[150px] opacity-[0.06] text-white">✚</div>
        <div className="anim-float absolute -bottom-10 -left-10 text-[180px] opacity-[0.06] text-white" style={{ animationDelay: "2.5s" }}>✚</div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold text-white">{t("cta_section_title")}</h2>
          <p className="mb-8 text-lg text-white/80">{t("cta_section_desc")}</p>
          <Link
            href={locale === "fr" ? "/booking" : `/${locale}/booking`}
            className="inline-block rounded-full bg-white px-8 py-3 font-semibold transition-transform hover:scale-105"
            style={{ color: "var(--color-primary)" }}
          >
            {t("cta_booking")}
          </Link>
        </div>
      </section>
    </div>
  );
}
