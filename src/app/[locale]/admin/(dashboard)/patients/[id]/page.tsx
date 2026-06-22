"use client";

import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

type MedicalAct = {
  id: string;
  patientRecordId: string;
  actType: string;
  actDate: string;
  description: string | null;
  doctorNotes: string | null;
  prescribedMeds: string | null;
  createdAt: string;
};

type PatientRecord = {
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
  medicalActs: MedicalAct[];
};

const ACT_TYPES = ["CONSULTATION", "ECHO", "SURGERY", "FOLLOW_UP", "PRESCRIPTION", "OTHER"];

export default function PatientDetailPage() {
  const params = useParams<{ locale: string; id: string }>();
  const locale = params.locale;
  const router = useRouter();
  const t = useTranslations("admin");
  const { toast } = useToast();

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [actForm, setActForm] = useState({ actType: "CONSULTATION", actDate: "", description: "", doctorNotes: "", prescribedMeds: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ nationalId: "", address: "", email: "", notes: "", nextAppointmentAt: "", nextAppointmentNotes: "" });

  useEffect(() => {
    fetch(`/api/admin/patients/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient(data);
      })
      .catch(() => setError("Failed to load patient"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const openEditModal = () => {
    if (!patient) return;
    setEditForm({
      nationalId: patient.nationalId || "",
      address: patient.address || "",
      email: patient.email || "",
      notes: patient.notes || "",
      nextAppointmentAt: patient.nextAppointmentAt ? patient.nextAppointmentAt.slice(0, 10) : "",
      nextAppointmentNotes: patient.nextAppointmentNotes || "",
    });
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/patients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nationalId: editForm.nationalId || null,
          address: editForm.address || null,
          email: editForm.email || null,
          notes: editForm.notes || null,
          nextAppointmentAt: editForm.nextAppointmentAt || null,
          nextAppointmentNotes: editForm.nextAppointmentNotes || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPatient((prev) => prev ? { ...prev, ...updated } : prev);
        setShowEditModal(false);
        toast("success", t("toast_patient_updated"));
      } else {
        toast("error", t("toast_update_error"));
      }
    } finally {
      setSaving(false);
    }
  };

  const addAct = async () => {
    if (!actForm.actDate) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/patients/${params.id}/acts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actForm),
      });
      if (res.ok) {
        const act = await res.json();
        setPatient((prev) => prev ? { ...prev, medicalActs: [act, ...prev.medicalActs] } : prev);
        setActForm({ actType: "CONSULTATION", actDate: "", description: "", doctorNotes: "", prescribedMeds: "" });
        toast("success", t("toast_act_added"));
      } else {
        toast("error", t("toast_act_add_error"));
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteAct = async (actId: string) => {
    if (!confirm(t("delete_act_confirm"))) return;
    try {
      const res = await fetch(`/api/admin/patients/${params.id}/acts/${actId}`, { method: "DELETE" });
      if (res.ok) {
        setPatient((prev) => prev ? { ...prev, medicalActs: prev.medicalActs.filter((a) => a.id !== actId) } : prev);
        toast("success", t("toast_act_deleted"));
      } else {
        toast("error", t("toast_delete_error"));
      }
    } catch {
      toast("error", t("toast_network_error"));
    }
  };

  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadPdf = async () => {
    if (!patient) return;
    const { default: html2canvas } = await import("html2canvas");
    const { default: jsPDF } = await import("jspdf");
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgW = 190;
    const imgH = (canvas.height * imgW) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgW, imgH);
    pdf.save(`${patient.patientName.replace(/\s+/g, "_")}_dossier.pdf`);
  };

  if (loading) return <div className="py-12 text-center opacity-60">{t("loading")}</div>;
  if (error || !patient) return <div className="py-12 text-center text-red-500">{error || t("not_found")}</div>;

  const actTypeLabels: Record<string, string> = {
    CONSULTATION: t("act_consultation"),
    ECHO: t("act_echo"),
    SURGERY: t("act_surgery"),
    FOLLOW_UP: t("act_follow_up"),
    PRESCRIPTION: t("act_prescription"),
    OTHER: t("act_other"),
  };

  const actTypeColors: Record<string, string> = {
    CONSULTATION: "#dbeafe",
    ECHO: "#d1fae5",
    SURGERY: "#fee2e2",
    FOLLOW_UP: "#fef3c7",
    PRESCRIPTION: "#ede9fe",
    OTHER: "#f3f4f6",
  };

  return (
    <div>
      <Link href={`/${locale}/admin/patients`} className="no-print mb-4 inline-block text-sm opacity-60 hover:opacity-100">
        ← {t("back_to_patients")}
      </Link>

      <div ref={pdfRef}>
      <div className="mb-8 rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{patient.patientName}</h1>
            <p className="mt-1 text-sm opacity-70">{patient.phone}{patient.email ? ` • ${patient.email}` : ""}{patient.city ? ` • ${patient.city}` : ""}</p>
            {patient.nationalId && <p className="mt-1 text-xs opacity-50">{t("national_id")}: {patient.nationalId}</p>}
            {patient.address && <p className="mt-1 text-xs opacity-50">{t("address")}: {patient.address}</p>}
          </div>
          <div className="flex items-center gap-3 no-print">
            <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}>
              {patient.medicalActs.length} {t("acts_count")}
            </span>
            <button onClick={openEditModal} className="rounded-lg px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
              {t("edit")}
            </button>
            <button onClick={downloadPdf} className="rounded-lg px-3 py-1 text-xs font-medium transition-opacity hover:opacity-90" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
              PDF
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <div className="no-print rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("add_act")}</h2>
          <div className="space-y-3">
            <select
              value={actForm.actType}
              onChange={(e) => setActForm({ ...actForm, actType: e.target.value })}
              className="w-full rounded-lg border p-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            >
              {ACT_TYPES.map((type) => (
                <option key={type} value={type}>{actTypeLabels[type]}</option>
              ))}
            </select>
            <input
              type="date"
              value={actForm.actDate}
              onChange={(e) => setActForm({ ...actForm, actDate: e.target.value })}
              className="w-full rounded-lg border p-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <input
              value={actForm.description}
              onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
              placeholder={t("act_description_placeholder")}
              className="w-full rounded-lg border p-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <textarea
              value={actForm.doctorNotes}
              onChange={(e) => setActForm({ ...actForm, doctorNotes: e.target.value })}
              placeholder={t("act_doctor_notes_placeholder")}
              rows={3}
              className="w-full resize-none rounded-lg border p-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <input
              value={actForm.prescribedMeds}
              onChange={(e) => setActForm({ ...actForm, prescribedMeds: e.target.value })}
              placeholder={t("act_prescribed_placeholder")}
              className="w-full rounded-lg border p-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <button
              onClick={addAct}
              disabled={saving || !actForm.actDate}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t("add_act_btn")}
            </button>
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("next_appointment")}</h2>
          {patient.nextAppointmentAt ? (
            <div>
              <p className="text-sm font-medium">{new Date(patient.nextAppointmentAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}</p>
              {patient.nextAppointmentNotes && <p className="mt-1 text-xs opacity-70">{patient.nextAppointmentNotes}</p>}
            </div>
          ) : (
            <p className="text-sm opacity-60">{t("no_next_appointment")}</p>
          )}
          {patient.notes && (
            <div className="mt-4">
              <h3 className="mb-1 text-xs font-semibold opacity-70">{t("patient_notes")}</h3>
              <p className="text-sm whitespace-pre-wrap opacity-80">{patient.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-6 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("medical_history")}</h2>
        {patient.medicalActs.length === 0 ? (
          <p className="py-8 text-center text-sm opacity-60">{t("no_acts")}</p>
        ) : (
          <div className="space-y-4">
            {patient.medicalActs.map((act) => (
              <div key={act.id} className="rounded-lg border p-4 transition-shadow hover:shadow-sm" style={{ borderColor: "#e5e7eb" }}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ backgroundColor: actTypeColors[act.actType] || "#f3f4f6" }}>
                      {actTypeLabels[act.actType] || act.actType}
                    </span>
                    <span className="text-xs opacity-50">{new Date(act.actDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}</span>
                  </div>
                  <button onClick={() => deleteAct(act.id)} className="text-xs text-red-500 hover:underline">
                    {t("delete_btn")}
                  </button>
                </div>
                {act.description && <p className="mb-1 text-sm">{act.description}</p>}
                {act.doctorNotes && <p className="mb-1 text-xs opacity-70"><span className="font-medium">{t("doctor_notes")}:</span> {act.doctorNotes}</p>}
                {act.prescribedMeds && <p className="text-xs opacity-70"><span className="font-medium">{t("prescribed")}:</span> {act.prescribedMeds}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      {showEditModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowEditModal(false)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("edit_patient_info")}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium opacity-70">{t("national_id")}</label>
                <input value={editForm.nationalId} onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })} placeholder="CIN / Passport" className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium opacity-70">{t("address")}</label>
                <input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} placeholder={t("address_placeholder")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium opacity-70">Email</label>
                <input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} placeholder="Email" className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium opacity-70">{t("patient_notes")}</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="w-full resize-none rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium opacity-70">{t("next_appointment")}</label>
                <input type="date" value={editForm.nextAppointmentAt} onChange={(e) => setEditForm({ ...editForm, nextAppointmentAt: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
              <div>
                <input value={editForm.nextAppointmentNotes} onChange={(e) => setEditForm({ ...editForm, nextAppointmentNotes: e.target.value })} placeholder={t("next_appointment_notes_placeholder")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">{t("cancel")}</button>
              <button onClick={saveEdit} disabled={saving} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
