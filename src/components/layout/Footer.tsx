import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { locale: string };

export async function Footer({ locale }: Props) {
  const t = await getTranslations({ locale, namespace: "footer" });

  return (
    <footer className="relative overflow-hidden py-12 text-center text-sm" style={{ backgroundColor: "oklch(18% 0.02 340)", color: "#fff" }}>
      <div className="anim-float absolute -right-20 -top-20 text-[200px] font-bold opacity-[0.03]">✚</div>
      <div className="anim-float absolute -bottom-20 -left-20 text-[200px] font-bold opacity-[0.03]" style={{ animationDelay: "2s" }}>✚</div>
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mb-6 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <Link href="/about" className="opacity-70 transition-opacity hover:opacity-100">À propos</Link>
          <Link href="/services" className="opacity-70 transition-opacity hover:opacity-100">Services</Link>
          <Link href="/booking" className="opacity-70 transition-opacity hover:opacity-100">Rendez-vous</Link>
          <Link href="/contact" className="opacity-70 transition-opacity hover:opacity-100">Contact</Link>
        </div>
        <div className="mb-6 flex justify-center gap-6">
          <Link href="/legal" className="opacity-60 underline transition-opacity hover:opacity-100">{t("legal")}</Link>
          <Link href="/privacy" className="opacity-60 underline transition-opacity hover:opacity-100">{t("privacy")}</Link>
          <Link href="/gestion" className="opacity-40 underline transition-opacity hover:opacity-80 text-xs">Gestion</Link>
        </div>
        <p className="opacity-60">{t("rights")}</p>
        <p className="mt-2 font-semibold opacity-80">{t("emergency")}</p>
      </div>
    </footer>
  );
}
