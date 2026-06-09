"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/ui/Toast";

type Holiday = { id: string; date: string; label: string | null };

export default function SettingsPage() {
  const t = useTranslations("admin");
  const { toast } = useToast();

  const [workStartAM, setWorkStartAM] = useState(9);
  const [workEndAM, setWorkEndAM] = useState(13);
  const [workStartPM, setWorkStartPM] = useState(15);
  const [workEndPM, setWorkEndPM] = useState(19);
  const [slotDuration, setSlotDuration] = useState(30);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayLabel, setNewHolidayLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setWorkStartAM(data.config.workStartAM);
        setWorkEndAM(data.config.workEndAM);
        setWorkStartPM(data.config.workStartPM);
        setWorkEndPM(data.config.workEndPM);
        setSlotDuration(data.config.slotDuration);
        setHolidays(data.holidays);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workStartAM, workEndAM, workStartPM, workEndPM, slotDuration }),
      });
      if (res.ok) toast("success", t("toast_settings_saved"));
      else toast("error", t("toast_settings_error"));
    } catch {
      toast("error", t("toast_network_error"));
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = async () => {
    if (!newHolidayDate) return;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newHolidayDate, label: newHolidayLabel }),
      });
      if (res.ok) {
        const h = await res.json();
        setHolidays((prev) => [...prev, h].sort((a, b) => a.date.localeCompare(b.date)));
        setNewHolidayDate("");
        setNewHolidayLabel("");
        toast("success", t("toast_holiday_added"));
      }
    } catch {
      toast("error", t("toast_network_error"));
    }
  };

  const deleteHoliday = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/settings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHolidays((prev) => prev.filter((h) => h.id !== id));
        toast("success", t("toast_holiday_deleted"));
      }
    } catch {
      toast("error", t("toast_network_error"));
    }
  };

  if (loading) return <div className="p-8 text-center opacity-60">{t("loading")}</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("settings_title")}
      </h1>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold">{t("settings_hours")}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_morning_start")}</label>
            <input type="number" min={0} max={23} value={workStartAM} onChange={(e) => setWorkStartAM(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_morning_end")}</label>
            <input type="number" min={0} max={23} value={workEndAM} onChange={(e) => setWorkEndAM(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_afternoon_start")}</label>
            <input type="number" min={0} max={23} value={workStartPM} onChange={(e) => setWorkStartPM(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_afternoon_end")}</label>
            <input type="number" min={0} max={23} value={workEndPM} onChange={(e) => setWorkEndPM(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_slot_duration")}</label>
            <input type="number" min={5} max={120} step={5} value={slotDuration} onChange={(e) => setSlotDuration(Number(e.target.value))} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
        </div>
        <button onClick={saveConfig} disabled={saving} className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: "var(--color-primary)" }}>
          {saving ? "..." : t("settings_save")}
        </button>
      </div>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold">{t("settings_holidays")}</h2>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_holiday_date")}</label>
            <input type="date" value={newHolidayDate} onChange={(e) => setNewHolidayDate(e.target.value)} className="rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("settings_holiday_label")}</label>
            <input type="text" value={newHolidayLabel} onChange={(e) => setNewHolidayLabel(e.target.value)} placeholder={t("settings_holiday_placeholder")} className="rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <button onClick={addHoliday} disabled={!newHolidayDate} className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: "var(--color-primary)" }}>
            {t("settings_holiday_add")}
          </button>
        </div>
        {holidays.length === 0 ? (
          <p className="text-sm opacity-60">{t("settings_no_holidays")}</p>
        ) : (
          <ul className="space-y-2">
            {holidays.map((h) => (
              <li key={h.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span>{new Date(h.date).toLocaleDateString("fr-FR")}{h.label ? ` — ${h.label}` : ""}</span>
                <button onClick={() => deleteHoliday(h.id)} className="text-xs text-red-500 hover:underline">{t("settings_holiday_delete")}</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
