"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function LogoutButton() {
  const t = useTranslations("admin");
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/gestion" })}
      className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: "#ef4444" }}
    >
      {t("logout")}
    </button>
  );
}
