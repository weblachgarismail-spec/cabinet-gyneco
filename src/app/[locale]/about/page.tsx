import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

type ApproachItem = { icon: string; title: string; desc: string };
type JourneyItem = { year: string; title: string; desc: string };

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  const tHome = await getTranslations({ locale, namespace: "home" });

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden px-4 text-center">
        <img
          src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1400&q=80"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }} />
        <div className="anim-float absolute -right-16 -top-16 text-[200px] opacity-[0.06]">✚</div>
        <div className="anim-float absolute -bottom-20 -left-20 text-[250px] opacity-[0.06]" style={{ animationDelay: "2s" }}>✚</div>
        <div className="relative z-10 max-w-2xl">
          <div className="anim-fade-in-up mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 shadow-lg" style={{ borderColor: "var(--color-primary-light)" }}>
            <img
              src="https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&q=80"
              alt={t("photo_alt")}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="anim-fade-in-up mb-3 text-4xl font-bold md:text-5xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("title")}
          </h1>
          <p className="anim-fade-in-up anim-delay-1 text-xl opacity-80">{t("subtitle")}</p>
        </div>
      </section>

      {/* ── Bio + Photo ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="anim-fade-in-up flex flex-col items-center gap-10 md:flex-row md:items-start">
          <div className="h-72 w-72 shrink-0 overflow-hidden rounded-2xl shadow-md">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80"
              alt={t("photo_alt")}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-4 text-lg leading-relaxed">
            {(t.raw("paragraphs") as string[]).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 py-16" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {(tHome.raw("stats") as Array<{ value: string; label: string }>).map((s, i) => (
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

      {/* ── Approach ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="anim-fade-in-up mb-12 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
          {t("approach_title")}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(t.raw("approach_items") as ApproachItem[]).map((item, i) => (
            <div
              key={i}
              className="anim-fade-in-up group rounded-2xl p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ backgroundColor: "#fff", animationDelay: `${i * 0.15}s` }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ backgroundColor: "var(--color-primary-light)" }}>
                {item.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed opacity-75">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Journey Timeline ── */}
      <section className="px-4 py-16" style={{ backgroundColor: "var(--color-primary-light)" }}>
        <div className="mx-auto max-w-4xl">
          <h2 className="anim-fade-in-up mb-12 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
            {t("journey_title")}
          </h2>
          <div className="relative space-y-8">
            <div className="absolute left-[23px] top-2 h-[calc(100%-16px)] w-0.5 md:left-1/2 md:-translate-x-1/2" style={{ backgroundColor: "var(--color-primary)" }} />
            {(t.raw("journey_items") as JourneyItem[]).map((item, i) => (
              <div key={i} className={`anim-fade-in-up relative flex items-start gap-6 md:w-1/2 ${i % 2 === 0 ? "md:ml-0 md:flex-row" : "md:ml-auto md:flex-row-reverse"}`} style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow" style={{ backgroundColor: "var(--color-primary)" }}>
                  <span>{item.year.slice(-2)}</span>
                </div>
                <div className="rounded-xl p-5 shadow-sm" style={{ backgroundColor: "#fff" }}>
                  <span className="mb-1 block text-sm font-semibold" style={{ color: "var(--color-primary)" }}>{item.year}</span>
                  <h3 className="mb-1 font-semibold" style={{ color: "var(--color-primary-dark)" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed opacity-75">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Diplomas ── */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="anim-fade-in-up mb-8 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
          {t("diplomas_title")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {(t.raw("diplomas") as string[]).map((d, i) => (
            <div key={i} className="anim-fade-in-up rounded-xl p-5 text-center shadow-sm transition-transform hover:-translate-y-1" style={{ backgroundColor: "#fff", animationDelay: `${i * 0.12}s` }}>
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-lg" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" }}>✓</div>
              <p className="text-sm leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <p className="anim-fade-in anim-delay-3 mx-auto mt-10 max-w-lg rounded-xl p-4 text-center font-medium" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
          {t("languages")}
        </p>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-4 py-20 text-center" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))" }}>
        <div className="anim-float absolute -right-10 -top-10 text-[150px] opacity-[0.06] text-white">✚</div>
        <div className="anim-float absolute -bottom-10 -left-10 text-[180px] opacity-[0.06] text-white" style={{ animationDelay: "2.5s" }}>✚</div>
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold text-white">{t("cta_title")}</h2>
          <p className="mb-8 text-lg text-white/80">{t("cta_desc")}</p>
          <Link
            href={locale === "fr" ? "/booking" : `/${locale}/booking`}
            className="inline-block rounded-full bg-white px-8 py-3 font-semibold transition-transform hover:scale-105"
            style={{ color: "var(--color-primary)" }}
          >
            {locale === "fr" ? "Prendre un rendez-vous" : "احجزي موعدًا"}
          </Link>
        </div>
      </section>
    </div>
  );
}
