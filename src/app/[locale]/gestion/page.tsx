"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export default function GestionLoginPage() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error === "INACTIVE_ACCOUNT") {
      setError("Compte désactivé. Contactez l'administrateur.");
    } else if (result?.error === "RATE_LIMITED") {
      setError("Trop de tentatives. Réessayez dans 15 minutes.");
    } else if (result?.error) {
      setError("Identifiants incorrects");
    } else {
      router.push(`${locale === "fr" ? "" : `/${locale}`}/admin/appointments`);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full rounded-xl p-8 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
          {t("login_title")}
        </h1>

        {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{error}</div>}

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'utilisateur"
            className="w-full rounded-lg border p-3 outline-none"
            style={{ borderColor: "#d1d5db" }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="w-full rounded-lg border p-3 outline-none"
            style={{ borderColor: "#d1d5db" }}
          />
          <button
            type="submit"
            className="w-full rounded-lg px-6 py-3 font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {t("login_button")}
          </button>
        </div>
      </form>
    </div>
  );
}
