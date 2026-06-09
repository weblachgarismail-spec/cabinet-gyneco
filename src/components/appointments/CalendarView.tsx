"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type CalendarAppointment = {
  id: string;
  date: string;
  time: string;
  patientName: string;
  phone: string;
  status: string;
  arrivedAt: string | null;
  cancelComment: string | null;
  postponedToDate: string | null;
};

type Props = {
  appointments: CalendarAppointment[];
  locale: string;
  canAct: boolean;
  isDoctor: boolean;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
  loading: string | null;
  onConfirm: (id: string) => void;
  onArrived: (id: string) => void;
  onMissed: (id: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (id: string) => void;
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function CalendarView({
  appointments, locale, canAct, isDoctor, statusLabels, statusColors,
  loading, onConfirm, onArrived, onMissed, onCancel, onDelete, onComment,
}: Props) {
  const t = useTranslations("admin");
  const today = new Date();
  const [viewDate, setViewDate] = useState(today.toDateString());
  const [popover, setPopover] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  const current = new Date(viewDate);

  const dayAppts = useMemo(() => {
    return appointments.filter((a) => {
      const ad = new Date(a.date);
      return ad.toDateString() === current.toDateString();
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, current]);

  const weekStart = useMemo(() => {
    const d = new Date(current);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [current]);

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [weekStart]);

  const weekAppts = useMemo(() => {
    const map: Record<string, CalendarAppointment[]> = {};
    weekDays.forEach((d) => { map[d.toDateString()] = []; });
    appointments.forEach((a) => {
      const ad = new Date(a.date);
      const key = ad.toDateString();
      if (map[key]) map[key].push(a);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [appointments, weekDays]);

  const goToday = () => setViewDate(new Date().toDateString());
  const goPrev = () => {
    const d = new Date(current);
    viewMode === "day" ? d.setDate(d.getDate() - 1) : d.setDate(d.getDate() - 7);
    setViewDate(d.toDateString());
  };
  const goNext = () => {
    const d = new Date(current);
    viewMode === "day" ? d.setDate(d.getDate() + 1) : d.setDate(d.getDate() + 7);
    setViewDate(d.toDateString());
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const formatDateShort = (d: Date) =>
    d.toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR", { weekday: "short", day: "numeric" });

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  const renderApptCard = (a: CalendarAppointment) => {
    const isPast = a.status === "CANCELLED" || a.status === "MISSED";
    const noShow = a.status === "CONFIRMED" && !a.arrivedAt && new Date(a.date).toDateString() === new Date().toDateString();
    return (
      <div key={a.id} className="relative">
        <div
          className="cursor-pointer rounded-md px-2 py-1 text-xs leading-tight transition-shadow hover:shadow-md"
          style={{
            backgroundColor: statusColors[a.status] || "#f3f4f6",
            opacity: isPast ? 0.5 : 1,
            borderLeft: noShow ? "3px solid #ef4444" : undefined,
          }}
          onClick={() => setPopover(popover === a.id ? null : a.id)}
        >
          <div className="font-medium">{a.time}</div>
          <div className="truncate font-semibold">{a.patientName}</div>
          <div className="opacity-70">{a.phone}</div>
        </div>
        {popover === a.id && (
          <div
            className="absolute left-0 top-full z-50 mt-1 w-40 rounded-xl bg-white p-2 shadow-xl"
            onClick={() => setPopover(null)}
          >
            <div className="mb-1 px-1 text-[10px] font-medium opacity-60">{statusLabels[a.status] || a.status}</div>
            <div className="flex flex-col gap-1">
              {canAct && a.status === "PENDING" && (
                <button onClick={() => { onConfirm(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">{t("calendar_confirm")}</button>
              )}
              {canAct && a.status === "CONFIRMED" && (
                <button onClick={() => { onArrived(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white">{t("calendar_arrived")}</button>
              )}
              {canAct && a.status === "CONFIRMED" && (
                <button onClick={() => { onMissed(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">{t("calendar_missed")}</button>
              )}
              {canAct && a.status !== "CANCELLED" && a.status !== "ARRIVED" && a.status !== "MISSED" && a.status !== "POSTPONED" && (
                <button onClick={() => { onCancel(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-orange-400 px-2 py-1 text-xs font-medium text-white">{t("calendar_cancel")}</button>
              )}
              {canAct && (
                <button onClick={() => { onDelete(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white">{t("calendar_delete")}</button>
              )}
              {isDoctor && (
                <button onClick={() => { onComment(a.id); setPopover(null); }} disabled={loading === a.id} className="rounded bg-purple-500 px-2 py-1 text-xs font-medium text-white">{t("calendar_comment")}</button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("day")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "day" ? "text-white" : "opacity-60 hover:opacity-100"}`}
            style={{ backgroundColor: viewMode === "day" ? "var(--color-primary)" : "#f3f4f6" }}
          >
            {t("calendar_day")}
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "week" ? "text-white" : "opacity-60 hover:opacity-100"}`}
            style={{ backgroundColor: viewMode === "week" ? "var(--color-primary)" : "#f3f4f6" }}
          >
            {t("calendar_week")}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goPrev} className="rounded-lg px-3 py-1.5 text-sm opacity-60 hover:opacity-100" style={{ backgroundColor: "#f3f4f6" }}>←</button>
          <span className="min-w-[180px] text-center text-sm font-semibold capitalize" style={{ color: "var(--color-primary-dark)" }}>
            {viewMode === "day" ? formatDate(current) : `${formatDateShort(weekDays[0])} — ${formatDateShort(weekDays[6])}`}
          </span>
          <button onClick={goNext} className="rounded-lg px-3 py-1.5 text-sm opacity-60 hover:opacity-100" style={{ backgroundColor: "#f3f4f6" }}>→</button>
          <button onClick={goToday} className="rounded-lg px-3 py-1.5 text-xs font-medium opacity-60 hover:opacity-100" style={{ backgroundColor: "#f3f4f6" }}>
            {t("calendar_today")}
          </button>
        </div>
      </div>

      {viewMode === "day" && (
        <div className="rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
          {HOURS.map((hour) => {
            const hourStr = `${hour.toString().padStart(2, "0")}`;
            const apptsAtHour = dayAppts.filter((a) => a.time.startsWith(hourStr));
            const isEmpty = apptsAtHour.length === 0;
            return (
              <div key={hour} className="flex border-b" style={{ borderColor: "#f3f4f6" }}>
                <div className="w-16 shrink-0 px-2 py-3 text-center text-xs opacity-50">
                  {hourStr}:00
                </div>
                <div className={`flex min-h-[48px] flex-1 flex-wrap gap-1 px-2 py-1 ${isEmpty ? "items-center" : ""}`}>
                  {isEmpty ? (
                    <span className="text-[11px] opacity-30">—</span>
                  ) : (
                    apptsAtHour.map(renderApptCard)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const key = d.toDateString();
            const dayAppts = weekAppts[key] || [];
            return (
              <div
                key={key}
                className="min-h-[200px] rounded-xl p-2 shadow-sm"
                style={{ backgroundColor: "#fff", outline: isToday(d) ? "2px solid var(--color-primary)" : undefined }}
              >
                <div className={`mb-2 text-center text-xs font-semibold ${isToday(d) ? "text-lg" : ""}`} style={{ color: isToday(d) ? "var(--color-primary)" : undefined }}>
                  {formatDateShort(d)}
                </div>
                <div className="flex flex-col gap-1">
                  {dayAppts.length === 0 && <span className="text-center text-[11px] opacity-30">—</span>}
                  {dayAppts.map(renderApptCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
