import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ChatBot } from "@/components/chat/ChatBot";
import { LocaleProvider } from "@/components/layout/LocaleProvider";
import { AuthProvider } from "@/components/layout/AuthProvider";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

const fonts = {
  fr: "Arial, Helvetica, sans-serif",
  ar: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (locale !== "fr" && locale !== "ar") notFound();

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "nav" });
  const navLabels: Record<string, string> = {
    home: t("home"),
    about: t("about"),
    services: t("services"),
    blog: t("blog"),
    booking: t("booking"),
    contact: t("contact"),
    admin: t("admin"),
    lang: t("lang"),
  };

  return (
    <AuthProvider>
    <LocaleProvider>
      <NextIntlClientProvider messages={messages}>
        <div className="flex min-h-screen flex-col" style={{ fontFamily: fonts[locale as keyof typeof fonts] || fonts.fr }}>
          <Header navLabels={navLabels} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} />
          <WhatsAppButton />
          <ChatBot />
        </div>
      </NextIntlClientProvider>
    </LocaleProvider>
    </AuthProvider>
  );
}
