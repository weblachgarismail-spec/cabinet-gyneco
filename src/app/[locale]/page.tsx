import { getTranslations } from "next-intl/server";
import Link from "next/link";
import BookingModal from "@/components/BookingModal";
import { FAQ } from "@/components/FAQ";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("home_title"),
    description: t("home_desc"),
    alternates: { canonical: `/${locale}` },
  };
}

type ServiceItem = { title: string; desc: string; slug: string; img: string };
type FeatureItem = { title: string; desc: string; img: string };
type TestimonialItem = { name: string; text: string; rating: number };
type FaqItem = { question: string; answer: string };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div>
      {/* ─── HERO ─── */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--color-primary-light) 0%, oklch(92% 0.04 340) 50%, #fff 100%)" }} />
        <div className="anim-blob absolute -left-32 -top-32 h-96 w-96 opacity-20" style={{ background: "var(--color-primary)" }} />
        <div className="anim-blob absolute -bottom-32 -right-32 h-96 w-96 opacity-15" style={{ background: "var(--color-primary-dark)", animationDelay: "-4s" }} />
        <div className="anim-blob absolute left-1/3 top-1/3 h-64 w-64 opacity-10" style={{ background: "var(--color-accent)", animationDelay: "-2s" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 80% 20%, oklch(55% 0.15 340 / 0.06) 0%, transparent 50%)" }} />
        <div className="anim-float absolute -right-10 top-20 text-[180px] font-bold opacity-[0.04]" style={{ color: "var(--color-primary)" }}>✚</div>
        <div className="anim-float absolute -left-10 bottom-20 text-[220px] font-bold opacity-[0.04]" style={{ color: "var(--color-primary-dark)", animationDelay: "2.5s" }}>✚</div>

        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <div className="anim-fade-in-up mb-6 inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase" style={{ backgroundColor: "oklch(55% 0.15 340 / 0.1)", color: "var(--color-primary)" }}>
            Cabinet Gynécologique El Jadida
          </div>
          <h1 className="anim-fade-in-up anim-delay-1 mb-6 text-4xl font-extrabold leading-tight md:text-6xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("title")}
          </h1>
          <p className="anim-fade-in-up anim-delay-2 mx-auto mb-4 max-w-xl text-lg leading-relaxed md:text-xl" style={{ color: "oklch(40% 0.02 340 / 0.8)" }}>
            {t("subtitle")}
          </p>
          <p className="anim-fade-in-up anim-delay-2 mx-auto mb-10 max-w-2xl leading-relaxed opacity-70">
            {t("description")}
          </p>
          <div className="anim-fade-in-up anim-delay-3 flex flex-wrap justify-center gap-4">
            <BookingModal label={t("cta_booking")} className="btn-primary text-base" icon={<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>} />
            <Link href={`/${locale}/contact`} className="btn-outline text-base">
              {t("cta_contact")}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="anim-fade-in-up mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>Pourquoi nous choisir</span>
          <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("features_title")}
          </h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {(t.raw("features") as FeatureItem[]).map((f, i) => (
            <div key={i} className={`anim-fade-in-up anim-delay-${i + 1} card-hover group overflow-hidden rounded-2xl`} style={{ backgroundColor: "#fff" }}>
              <div className="relative h-52 overflow-hidden">
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, oklch(0% 0 0 / 0.3))", zIndex: 1 }} />
                <img src={f.img} alt={f.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                  {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold" style={{ color: "var(--color-primary-dark)" }}>{f.title}</h3>
                <p className="leading-relaxed opacity-75">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="relative overflow-hidden px-4 py-20" style={{ background: "linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))" }}>
        <div className="anim-float absolute -right-16 -top-16 text-[200px] font-bold opacity-[0.04] text-white">✚</div>
        <div className="anim-float absolute -bottom-20 -left-20 text-[250px] font-bold opacity-[0.04] text-white" style={{ animationDelay: "2s" }}>✚</div>
        <div className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {(t.raw("stats") as Array<{ value: string; label: string }>).map((s, i) => (
              <div key={i} className={`anim-fade-in-up text-center`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="text-4xl font-extrabold text-white md:text-5xl">{s.value}</div>
                <div className="mt-2 text-sm font-medium text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="anim-fade-in-up mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>Nos services</span>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("services_title")}
          </h2>
          <p className="mx-auto max-w-xl leading-relaxed opacity-70">{t("services_desc")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {((await getTranslations({ locale, namespace: "services" })).raw("items") as ServiceItem[]).slice(0, 3).map((item, i) => (
            <Link key={item.slug} href={`/${locale}/services/${item.slug}`} className={`anim-fade-in-up anim-delay-${i + 1} card-hover group overflow-hidden rounded-2xl`} style={{ backgroundColor: "#fff" }}>
              <div className="relative h-44 overflow-hidden">
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, oklch(0% 0 0 / 0.3))", zIndex: 1 }} />
                <img src={item.img} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <h3 className="mb-2 font-semibold" style={{ color: "var(--color-primary)" }}>{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-70">{item.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-primary)" }}>
                  En savoir plus <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="anim-fade-in-up mt-10 text-center">
          <Link href={`/${locale}/services`} className="btn-outline">
            {locale === "fr" ? "Voir tous nos services" : "عرض جميع الخدمات"}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* ─── ABOUT / DOCTOR ─── */}
      <section className="relative overflow-hidden px-4 py-24" style={{ background: "linear-gradient(135deg, oklch(92% 0.04 340), #fff)" }}>
        <div className="anim-blob absolute -left-32 -top-32 h-96 w-96 opacity-10" style={{ background: "var(--color-primary-dark)" }} />
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <div className="anim-fade-in-up relative">
            <div className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-3xl" style={{ boxShadow: "0 20px 60px oklch(0% 0 0 / 0.1)" }}>
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80"
                alt="Dr. [Nom] - Gynécologue"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 rounded-2xl p-5 text-white" style={{ background: "var(--color-primary)" }}>
              <div className="text-3xl font-bold">15+</div>
              <div className="text-xs font-medium opacity-80">{locale === "fr" ? "Années d'expérience" : "سنوات خبرة"}</div>
            </div>
          </div>
          <div className="anim-fade-in-up">
            <span className="mb-2 inline-block text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>Le docteur</span>
            <h2 className="mb-6 text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>
              {t("about_title")}
            </h2>
            <div className="space-y-4 leading-relaxed opacity-75">
              <p>Le Dr. [Nom] est gynécologue obstétricienne diplômée de la Faculté de Médecine de Casablanca, avec plus de 15 ans d'expérience en cabinet et en milieu hospitalier.</p>
              <p>Passionnée par la santé des femmes, elle offre des soins complets allant de l'adolescence à la ménopause, avec une approche fondée sur l'écoute, le respect et la confidentialité.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: "oklch(55% 0.15 340 / 0.08)", color: "var(--color-primary)" }}>
                <span>♥</span> {locale === "fr" ? "Bienveillance" : "العطف"}
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: "oklch(55% 0.15 340 / 0.08)", color: "var(--color-primary)" }}>
                <span>✚</span> {locale === "fr" ? "Excellence" : "التميز"}
              </div>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium" style={{ backgroundColor: "oklch(55% 0.15 340 / 0.08)", color: "var(--color-primary)" }}>
                <span>♡</span> {locale === "fr" ? "Confidentialité" : "السرية"}
              </div>
            </div>
            <Link href={`/${locale}/about`} className="btn-primary mt-8 inline-flex items-center gap-2">
              {t("about_cta")}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="mx-auto max-w-6xl px-4 py-24">
        <div className="anim-fade-in-up mb-14 text-center">
          <span className="mb-2 inline-block text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>Témoignages</span>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>
            {t("testimonials_title")}
          </h2>
          <p className="mx-auto max-w-xl leading-relaxed opacity-70">{t("testimonials_subtitle")}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(t.raw("testimonials") as TestimonialItem[]).map((item, i) => (
            <div key={i} className={`anim-fade-in-up rounded-2xl p-6`} style={{ backgroundColor: "oklch(92% 0.04 340 / 0.4)", animationDelay: `${i * 0.1}s` }}>
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="h-4 w-4" viewBox="0 0 20 20" fill={j < item.rating ? "var(--color-primary)" : "oklch(85% 0 0)"}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 text-sm leading-relaxed opacity-75">"{item.text}"</p>
              <div className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>— {item.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-4 py-24" style={{ background: "linear-gradient(135deg, oklch(92% 0.04 340 / 0.3), #fff)" }}>
        <div className="mx-auto max-w-3xl">
          <div className="anim-fade-in-up mb-14 text-center">
            <span className="mb-2 inline-block text-xs font-semibold tracking-widest uppercase" style={{ color: "var(--color-primary)" }}>FAQ</span>
            <h2 className="text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>
              {locale === "fr" ? "Questions fréquentes" : "الأسئلة الشائعة"}
            </h2>
          </div>
          <FAQ items={t.raw("faq") as FaqItem[]} />
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden px-4 py-24 text-center" style={{ background: "linear-gradient(135deg, oklch(92% 0.04 340), #fff)" }}>
        <div className="anim-float absolute -right-10 -top-10 text-[150px] font-bold opacity-[0.04]" style={{ color: "var(--color-primary)" }}>✚</div>
        <div className="anim-float absolute -bottom-10 -left-10 text-[180px] font-bold opacity-[0.04]" style={{ color: "var(--color-primary-dark)", animationDelay: "2.5s" }}>✚</div>
        <div className="anim-blob absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 opacity-[0.03]" style={{ background: "var(--color-primary-dark)" }} />
        <div className="relative mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl" style={{ color: "var(--color-primary-dark)" }}>{t("cta_section_title")}</h2>
          <p className="mb-8 text-lg opacity-70">{t("cta_section_desc")}</p>
          <BookingModal
            label={t("cta_booking")}
            className="btn-primary text-lg"
            icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
          />
        </div>
      </section>
    </div>
  );
}
