"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale || "fr";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
