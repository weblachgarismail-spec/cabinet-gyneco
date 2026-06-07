"use client";

import { useTranslations } from "next-intl";

export default function AdminGuidePage() {
  const t = useTranslations("admin");

  const sections = [
    { key: "guide_roles_title", items: ["guide_role_super_admin", "guide_role_secretary", "guide_role_doctor"] },
    { key: "guide_appointments_title", items: ["guide_appointments_create", "guide_appointments_status", "guide_appointments_walkin"] },
    { key: "guide_patients_title", items: ["guide_patients_search", "guide_patients_edit", "guide_patients_acts", "guide_patients_export"] },
    { key: "guide_export_title", items: ["guide_export_excel", "guide_export_sql", "guide_import"] },
    { key: "guide_logs_title", items: ["guide_logs_view"] },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("guide_title")}</h1>
      <div className="space-y-8">
        {sections.map(({ key, items }) => (
          <section key={key} className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
            <h2 className="mb-3 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t(key)}</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm opacity-80">
              {items.map((itemKey) => (
                <li key={itemKey}>{t(itemKey)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
