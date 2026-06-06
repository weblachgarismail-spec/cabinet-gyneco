import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Props = { params: Promise<{ locale: string }> };

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  const items = [
    { title: t("address_title"), content: t("address"), icon: "📍" },
    { title: t("phone_title"), content: t("phone"), icon: "📞" },
    { title: t("email_title"), content: t("email"), icon: "✉️" },
    { title: t("hours_title"), content: t("hours_week"), icon: "🕐" },
    { title: "", content: t("hours_sat"), icon: "" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-12 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("title")}
      </h1>

      <div className="mb-10 grid gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl p-5 shadow-sm" style={{ backgroundColor: "#fff" }}>
            {item.icon && <span className="text-xl">{item.icon}</span>}
            <div>
              {item.title && <h3 className="font-semibold">{item.title}</h3>}
              <p className="opacity-75">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 overflow-hidden rounded-xl shadow-sm">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106118.42023375433!2d-8.550391547107756!3d33.256933765445755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda912a150786261%3A0x5f8f2d461fa8f3c2!2sEl%20Jadida!5e0!3m2!1sfr!2sma!4v1"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="El Jadida Map"
        />
      </div>

      <div className="text-center">
        <Link
          href={`https://wa.me/2125XXXXXXXXX`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-8 py-3 font-semibold text-white transition-transform hover:scale-105"
          style={{ backgroundColor: "#25D366" }}
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t("whatsapp")}
        </Link>
      </div>
    </div>
  );
}
