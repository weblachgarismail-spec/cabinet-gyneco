"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const searchable = (p: { patientName: string; phone: string; nationalId: string | null; email: string | null; city: string | null; address: string | null }, q: string) => {
  if (!q) return true;
  const needle = q.toLowerCase();
  return p.patientName.toLowerCase().includes(needle)
    || p.phone.toLowerCase().includes(needle)
    || (p.nationalId ?? "").toLowerCase().includes(needle)
    || (p.email ?? "").toLowerCase().includes(needle)
    || (p.city ?? "").toLowerCase().includes(needle)
    || (p.address ?? "").toLowerCase().includes(needle);
};

const PAGE_SIZE = 50;

type Patient = {
  id: string;
  patientName: string;
  phone: string;
  nationalId: string | null;
  address: string | null;
  email: string | null;
  city: string | null;
  dateOfBirth: string | null;
  notes: string | null;
  nextAppointmentAt: string | null;
  nextAppointmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count: { medicalActs: number };
};

type ConfirmedAppt = {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  city: string | null;
  date: string;
  time: string;
};

type Props = { patients: Patient[]; trashedPatients: Patient[]; confirmedAppointments: ConfirmedAppt[]; usedPhones: Set<string>; locale: string; userRole: string };

export function PatientsTable({ patients, trashedPatients, confirmedAppointments, usedPhones, locale, userRole }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "trashed">("active");
  const [items, setItems] = useState(patients);
  const [trashItems, setTrashItems] = useState(trashedPatients);
  const [loading, setLoading] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [patientPage, setPatientPage] = useState(1);
  const [trashPage, setTrashPage] = useState(1);

  useEffect(() => { setPatientPage(1); }, [searchQuery]);
  useEffect(() => { setTrashPage(1); }, [searchQuery]);

  const availableAppointments = confirmedAppointments.filter((a) => !usedPhones.has(a.phone));

  const filteredItems = items.filter((p) => searchable(p, searchQuery));
  const filteredTrash = trashItems.filter((p) => searchable(p, searchQuery));

  const patientTotalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const trashTotalPages = Math.max(1, Math.ceil(filteredTrash.length / PAGE_SIZE));
  const safePatientPage = Math.min(patientPage, patientTotalPages);
  const safeTrashPage = Math.min(trashPage, trashTotalPages);
  const pagedPatients = filteredItems.slice((safePatientPage - 1) * PAGE_SIZE, safePatientPage * PAGE_SIZE);
  const pagedTrash = filteredTrash.slice((safeTrashPage - 1) * PAGE_SIZE, safeTrashPage * PAGE_SIZE);

  const resetCreateModal = () => {
    setShowCreateModal(false);
    setSelectedAppt("");
  };

  const createPatient = async () => {
    const appt = availableAppointments.find((a) => a.id === selectedAppt);
    if (!appt) return;
    const data = { patientName: appt.patientName, phone: appt.phone, email: appt.email || undefined, city: appt.city || undefined };
    setLoading("new");
    try {
      const res = await fetch("/api/admin/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [{ ...created, _count: { medicalActs: 0 } }, ...prev]);
        resetCreateModal();
      }
    } finally {
      setLoading(null);
    }
  };

  const deletePatient = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/patients/${id}`, { method: "DELETE" });
      if (res.ok) {
        const moved = items.find((p) => p.id === id);
        setItems((prev) => prev.filter((p) => p.id !== id));
        if (moved) setTrashItems((prev) => [{ ...moved, deletedAt: new Date().toISOString() }, ...prev]);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const exportToExcel = async (data: Patient[], filename: string) => {
    const XLSX = await import("xlsx");
    const rows = data.map((p) => ({
      ID: p.id,
      [t("table_patient")]: p.patientName,
      [t("table_phone")]: p.phone,
      [t("national_id")]: p.nationalId || "",
      [t("table_email")]: p.email || "",
      [t("table_address")]: p.address || "",
      [t("table_city")]: p.city || "",
      [t("table_dob")]: p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR") : "",
      [t("table_notes")]: p.notes || "",
      [t("table_created")]: new Date(p.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR"),
      [t("next_appointment")]: p.nextAppointmentAt ? new Date(p.nextAppointmentAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR") : "",
      [t("acts_count")]: p._count.medicalActs,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, filename);
  };

  const restorePatient = async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/patients/${id}/restore`, { method: "POST" });
      if (res.ok) {
        const restored = trashedPatients.find((p) => p.id === id) || trashItems.find((p) => p.id === id);
        setTrashItems((prev) => prev.filter((p) => p.id !== id));
        if (restored) setItems((prev) => [{ ...restored, deletedAt: null }, ...prev]);
        setLoading(null);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {userRole !== "DOCTOR" && (
          <button onClick={() => setShowCreateModal(true)} className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
            + {t("create_patient")}
          </button>
        )}
        <button
          onClick={() => exportToExcel(activeTab === "active" ? filteredItems : filteredTrash, `patients_${activeTab}_${new Date().toISOString().split("T")[0]}.xlsx`)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#10b981" }}
        >
          📥 {t("export_btn")}
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search_patients")}
          className="ml-auto rounded-lg border p-2 text-sm outline-none"
          style={{ borderColor: "#d1d5db", minWidth: 220 }}
        />
      </div>

      <div className="mb-4 flex gap-1 rounded-lg p-1" style={{ backgroundColor: "#f3f4f6" }}>
        <button
          onClick={() => setActiveTab("active")}
          className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          style={{ backgroundColor: activeTab === "active" ? "#fff" : "transparent", boxShadow: activeTab === "active" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          {t("active")} ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("trashed")}
          className="rounded-md px-4 py-1.5 text-sm font-medium transition-colors"
          style={{ backgroundColor: activeTab === "trashed" ? "#fff" : "transparent", boxShadow: activeTab === "trashed" ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}
        >
          {t("trash")} ({trashItems.length})
        </button>
      </div>

      {activeTab === "active" && (
        <>
          {filteredItems.length === 0 ? (
            <p className="py-12 text-center opacity-60">{t("no_patients")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#e5e7eb" }}>
                    <th className="p-3 font-semibold">{t("table_patient")}</th>
                    <th className="p-3 font-semibold whitespace-nowrap">ID</th>
                    <th className="p-3 font-semibold">{t("table_phone")}</th>
                    <th className="p-3 font-semibold">{t("national_id")}</th>
                    <th className="p-3 font-semibold">{t("table_email")}</th>
                    <th className="p-3 font-semibold">{t("table_address")}</th>
                    <th className="p-3 font-semibold">{t("table_city")}</th>
                    <th className="p-3 font-semibold">{t("table_dob")}</th>
                    <th className="p-3 font-semibold">{t("acts_count")}</th>
                    <th className="p-3 font-semibold">{t("next_appointment")}</th>
                    <th className="p-3 font-semibold">{t("table_created")}</th>
                    <th className="p-3 font-semibold">{t("table_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPatients.map((p) => (
                    <tr key={p.id} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                      <td className="p-3 whitespace-nowrap">
                        <Link href={`/${locale}/admin/patients/${p.id}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                          {p.patientName}
                        </Link>
                      </td>
                      <td className="p-3 text-xs opacity-50 font-mono" title={p.id}>{p.id.slice(0, 8)}…</td>
                      <td className="p-3 whitespace-nowrap">{p.phone}</td>
                      <td className="p-3 text-xs opacity-70 whitespace-nowrap">{p.nationalId || "—"}</td>
                      <td className="p-3 text-xs">{p.email || "—"}</td>
                      <td className="p-3 text-xs max-w-[150px] truncate" title={p.address ?? ""}>{p.address || "—"}</td>
                      <td className="p-3">{p.city || "—"}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR") : "—"}
                      </td>
                      <td className="p-3">{p._count.medicalActs}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {p.nextAppointmentAt ? (
                          <span>
                            {new Date(p.nextAppointmentAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="p-3 text-xs whitespace-nowrap opacity-60">
                        {new Date(p.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link href={`/${locale}/admin/patients/${p.id}`} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                            {t("view")}
                          </Link>
                          {userRole !== "DOCTOR" && (
                            <button onClick={() => deletePatient(p.id)} disabled={loading === p.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#ef4444" }}>
                              {t("delete_btn")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {patientTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-3">
                  <button onClick={() => setPatientPage((p) => Math.max(1, p - 1))} disabled={safePatientPage <= 1} className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30" style={{ backgroundColor: "#f3f4f6" }}>
                    {t("prev_page")}
                  </button>
                  <span className="text-sm opacity-70">{t("page_of", { page: safePatientPage, total: patientTotalPages })}</span>
                  <button onClick={() => setPatientPage((p) => Math.min(patientTotalPages, p + 1))} disabled={safePatientPage >= patientTotalPages} className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30" style={{ backgroundColor: "#f3f4f6" }}>
                    {t("next_page")}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "trashed" && (
        <>
          {filteredTrash.length === 0 ? (
            <p className="py-12 text-center opacity-60">{t("no_trashed_patients")}</p>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#e5e7eb" }}>
                    <th className="p-3 font-semibold">{t("table_patient")}</th>
                    <th className="p-3 font-semibold whitespace-nowrap">ID</th>
                    <th className="p-3 font-semibold">{t("table_phone")}</th>
                    <th className="p-3 font-semibold">{t("national_id")}</th>
                    <th className="p-3 font-semibold">{t("table_email")}</th>
                    <th className="p-3 font-semibold">{t("table_address")}</th>
                    <th className="p-3 font-semibold">{t("table_city")}</th>
                    <th className="p-3 font-semibold">{t("table_dob")}</th>
                    <th className="p-3 font-semibold">{t("acts_count")}</th>
                    <th className="p-3 font-semibold">{t("deleted_at")}</th>
                    <th className="p-3 font-semibold">{t("table_actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedTrash.map((p) => (
                    <tr key={p.id} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                      <td className="p-3 whitespace-nowrap">
                        <Link href={`/${locale}/admin/patients/${p.id}`} className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                          {p.patientName}
                        </Link>
                      </td>
                      <td className="p-3 text-xs opacity-50 font-mono" title={p.id}>{p.id.slice(0, 8)}…</td>
                      <td className="p-3 whitespace-nowrap">{p.phone}</td>
                      <td className="p-3 text-xs opacity-70 whitespace-nowrap">{p.nationalId || "—"}</td>
                      <td className="p-3 text-xs">{p.email || "—"}</td>
                      <td className="p-3 text-xs max-w-[150px] truncate" title={p.address ?? ""}>{p.address || "—"}</td>
                      <td className="p-3">{p.city || "—"}</td>
                      <td className="p-3 text-xs whitespace-nowrap">
                        {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR") : "—"}
                      </td>
                      <td className="p-3">{p._count.medicalActs}</td>
                      <td className="p-3 text-xs opacity-60 whitespace-nowrap">
                        {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR") : "—"}
                      </td>
                      <td className="p-3">
                        {userRole !== "DOCTOR" && (
                          <button onClick={() => restorePatient(p.id)} disabled={loading === p.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#10b981" }}>
                            {t("restore")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {trashTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 p-3">
                  <button onClick={() => setTrashPage((p) => Math.max(1, p - 1))} disabled={safeTrashPage <= 1} className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30" style={{ backgroundColor: "#f3f4f6" }}>
                    {t("prev_page")}
                  </button>
                  <span className="text-sm opacity-70">{t("page_of", { page: safeTrashPage, total: trashTotalPages })}</span>
                  <button onClick={() => setTrashPage((p) => Math.min(trashTotalPages, p + 1))} disabled={safeTrashPage >= trashTotalPages} className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30" style={{ backgroundColor: "#f3f4f6" }}>
                    {t("next_page")}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={resetCreateModal}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("create_patient_from_appt")}</h3>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium opacity-70">{t("select_patient")}</label>
              <select
                value={selectedAppt}
                onChange={(e) => setSelectedAppt(e.target.value)}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              >
                <option value="">{t("select_patient_placeholder")}</option>
                {availableAppointments.map((a) => (
                  <option key={a.id} value={a.id}>{a.patientName} - {a.phone} ({new Date(a.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")} {a.time})</option>
                ))}
              </select>
              {availableAppointments.length === 0 && (
                <p className="mt-2 text-xs opacity-60">{t("no_confirmed_appointments")}</p>
              )}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={resetCreateModal} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                {t("cancel")}
              </button>
              <button
                onClick={createPatient}
                disabled={loading === "new" || !selectedAppt}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {t("create")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
