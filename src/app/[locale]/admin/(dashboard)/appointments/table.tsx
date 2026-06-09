"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { CalendarView } from "@/components/appointments/CalendarView";
import { useToast } from "@/components/ui/Toast";

type Comment = {
  id: string;
  username: string;
  comment: string;
  createdAt: string;
};

type Appointment = {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  patientName: string;
  phone: string;
  email: string | null;
  city: string | null;
  notes: string | null;
  status: string;
  cancelComment: string | null;
  arrivedAt: string | null;
  remindedAt: string | null;
  postponedToDate: string | null;
  nationalId: string | null;
  consultationType: string | null;
  comments: Comment[];
};

type Props = { appointments: Appointment[]; locale: string; now: string; userRole: string };

const parseTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
};

export function AdminAppointmentsTable({ appointments, locale, now, userRole }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState(appointments);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<{ id: string } | null>(null);
  const [cancelComment, setCancelComment] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date(now));
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const [commentModal, setCommentModal] = useState<{ id: string } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [postponeModal, setPostponeModal] = useState<{ id: string } | null>(null);
  const [postponeDate, setPostponeDate] = useState("");
  const [walkinModal, setWalkinModal] = useState(false);
  const [walkinForm, setWalkinForm] = useState({ patientName: "", phone: "", email: "", city: "", date: "", time: "", nationalId: "", consultationType: "" });

  const isDoctor = userRole === "DOCTOR";
  const isSecretary = userRole === "SECRETARY";
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const canAct = isSecretary || isSuperAdmin;

  const PAGE_SIZE = 50;
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");

  const filtered = items.filter((a) => {
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterDate) {
      const d = new Date(a.date);
      const fd = new Date(filterDate);
      if (d.toDateString() !== fd.toDateString()) return false;
    }
    if (filterTime && !a.time.startsWith(filterTime)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const upcomingReminders = items.filter((a) => {
    if (a.status !== "CONFIRMED" || a.arrivedAt || a.remindedAt) return false;
    if (dismissedReminders.has(a.id)) return false;
    const ad = new Date(a.date);
    const today = new Date(currentTime);
    if (ad.toDateString() !== today.toDateString()) return false;
    const aptMin = parseTime(a.time);
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    const diff = aptMin - nowMin;
    return diff >= 0 && diff <= 30;
  });

  useEffect(() => { setPage(1); }, [filterStatus, filterDate, filterTime]);

  const remindedSent = useRef<Set<string>>(new Set());
  useEffect(() => {
    upcomingReminders.forEach((a) => {
      if (remindedSent.current.has(a.id)) return;
      remindedSent.current.add(a.id);
      fetch("/api/admin/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: a.id, remindedAt: true }),
      }).then((res) => {
        if (res.ok) {
          setItems((prev) =>
            prev.map((item) => (item.id === a.id ? { ...item, remindedAt: new Date().toISOString() } : item))
          );
        }
      });
    });
  }, [upcomingReminders]);

  const updateStatus = useCallback(async (id: string, status: string, comment?: string, postponedDate?: string) => {
    setLoading(id);
    try {
      const body: Record<string, unknown> = { id, status };
      if (comment !== undefined) body.cancelComment = comment;
      if (postponedDate !== undefined) body.postponedDate = postponedDate;

      const res = await fetch(`/api/admin/appointments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((a) =>
            a.id === id
              ? { ...a, status, cancelComment: comment || a.cancelComment, arrivedAt: status === "ARRIVED" ? new Date().toISOString() : a.arrivedAt, postponedToDate: postponedDate || a.postponedToDate }
              : a
          )
        );
        toast("success", t("toast_status_updated", { status: t(status.toLowerCase()) }));
        router.refresh();
      } else {
        toast("error", t("toast_update_error"));
      }
    } finally {
      setLoading(null);
    }
  }, [router, toast]);

  const handleCancelClick = (id: string) => {
    setCancelModal({ id });
    setCancelComment("");
  };

  const handleCancelConfirm = () => {
    if (!cancelModal) return;
    updateStatus(cancelModal.id, "CANCELLED", cancelComment);
    setCancelModal(null);
  };

  const deleteAppointment = async (id: string) => {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/appointments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((a) => a.id !== id));
        toast("success", t("toast_deleted"));
        router.refresh();
      } else {
        toast("error", t("toast_delete_error"));
      }
    } finally {
      setLoading(null);
    }
  };

  const submitComment = async () => {
    if (!commentModal || !commentText.trim()) return;
    setLoading(commentModal.id);
    try {
      const res = await fetch(`/api/admin/appointments/${commentModal.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      if (res.ok) {
        setCommentModal(null);
        setCommentText("");
        toast("success", t("toast_comment_sent"));
        router.refresh();
      } else {
        toast("error", t("toast_comment_error"));
      }
    } finally {
      setLoading(null);
    }
  };

  const statusColors: Record<string, string> = {
    PENDING: "#fef3c7",
    CONFIRMED: "#d1fae5",
    CANCELLED: "#fee2e2",
    ARRIVED: "#bfdbfe",
    MISSED: "#fca5a5",
    POSTPONED: "#fde68a",
  };

  const isNoShow = (a: Appointment) => {
    if (a.status !== "CONFIRMED" || a.arrivedAt) return false;
    const ad = new Date(a.date);
    const today = new Date(currentTime);
    if (ad.toDateString() !== today.toDateString()) return false;
    const aptMin = parseTime(a.time);
    const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();
    return nowMin > aptMin + 15;
  };

  const todayStr = new Date(currentTime).toDateString();
  const todayItems = items.filter((a) => new Date(a.date).toDateString() === todayStr);
  const stats = {
    today: todayItems.length,
    arrived: todayItems.filter((a) => a.status === "ARRIVED").length,
    missed: todayItems.filter((a) => a.status === "MISSED").length,
    postponed: items.filter((a) => a.status === "POSTPONED").length,
    pending: items.filter((a) => a.status === "PENDING").length,
    confirmed: todayItems.filter((a) => a.status === "CONFIRMED" && !a.arrivedAt).length,
  };

  const handlePostpone = () => {
    if (!postponeModal || !postponeDate) return;
    updateStatus(postponeModal.id, "POSTPONED", undefined, postponeDate);
    setPostponeModal(null);
    setPostponeDate("");
  };

  const [walkinDupWarn, setWalkinDupWarn] = useState<{ patientName: string; phone: string } | null>(null);

  const addWalkin = async (force = false) => {
    if (!walkinForm.patientName || !walkinForm.phone) return;
    setLoading("walkin");
    try {
      const res = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...walkinForm, force }),
      });
      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [created, ...prev]);
        setWalkinModal(false);
        setWalkinForm({ patientName: "", phone: "", email: "", city: "", date: "", time: "", nationalId: "", consultationType: "" });
        toast("success", t("toast_walkin_added"));
        router.refresh();
      } else if (res.status === 409) {
        const err = await res.json();
        if (err.error === "DUPLICATE_PHONE") {
          setWalkinDupWarn(err.duplicate);
        } else {
          toast("error", t("toast_walkin_error"));
        }
      } else {
        toast("error", t("toast_walkin_error"));
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      {canAct && upcomingReminders.length > 0 && (
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
            <span>🔔</span> {t("reminder_title")} ({upcomingReminders.length})
          </h3>
          <ul className="space-y-1">
            {upcomingReminders.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm text-blue-700">
                <span>{a.time} — {a.patientName} ({a.phone})</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(a.id, "ARRIVED")}
                    disabled={loading === a.id}
                    className="rounded px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: "#3b82f6" }}
                  >
                    {t("arrived_btn")}
                  </button>
                  <button
                    onClick={() => setDismissedReminders((prev) => new Set(prev).add(a.id))}
                    className="rounded px-2 py-0.5 text-xs font-medium opacity-60 hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
          <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{stats.today}</p>
          <p className="mt-1 text-xs opacity-60">{t("stats_today")}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
          <p className="text-2xl font-bold" style={{ color: "#10b981" }}>{stats.arrived}</p>
          <p className="mt-1 text-xs opacity-60">{t("stats_arrived")}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
          <p className="text-2xl font-bold" style={{ color: "#ef4444" }}>{stats.missed}</p>
          <p className="mt-1 text-xs opacity-60">{t("stats_missed")}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
          <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>{stats.postponed}</p>
          <p className="mt-1 text-xs opacity-60">{t("stats_postponed")}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm text-center" style={{ backgroundColor: "#fff" }}>
          <p className="text-2xl font-bold" style={{ color: "#3b82f6" }}>{stats.pending}</p>
          <p className="mt-1 text-xs opacity-60">{t("stats_pending")}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("table")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "table" ? "text-white" : "opacity-60 hover:opacity-100"}`}
            style={{ backgroundColor: viewMode === "table" ? "var(--color-primary)" : "#f3f4f6" }}
          >
            {t("view_table")}
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${viewMode === "calendar" ? "text-white" : "opacity-60 hover:opacity-100"}`}
            style={{ backgroundColor: viewMode === "calendar" ? "var(--color-primary)" : "#f3f4f6" }}
          >
            {t("view_calendar")}
          </button>
        </div>
        {canAct && (
          <button onClick={() => setWalkinModal(true)} className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
            + {t("walkin_add")}
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl p-3 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_status")}</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border p-1.5 text-sm outline-none" style={{ borderColor: "#d1d5db" }}>
            <option value="">{t("all")}</option>
            <option value="PENDING">{t("pending")}</option>
            <option value="CONFIRMED">{t("confirmed")}</option>
            <option value="ARRIVED">{t("arrived")}</option>
            <option value="MISSED">{t("missed")}</option>
            <option value="POSTPONED">{t("postponed")}</option>
            <option value="CANCELLED">{t("cancelled")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_date")}</label>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border p-1.5 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_time")}</label>
          <input type="time" value={filterTime} onChange={(e) => setFilterTime(e.target.value)} className="rounded-lg border p-1.5 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        {(filterStatus || filterDate || filterTime) && (
          <button onClick={() => { setFilterStatus(""); setFilterDate(""); setFilterTime(""); }} className="self-end rounded-lg px-3 py-1.5 text-xs font-medium opacity-60 hover:opacity-100">
            {t("clear_filters")}
          </button>
        )}
      </div>

      {viewMode === "calendar" ? (
        <CalendarView
          appointments={items}
          locale={locale}
          canAct={canAct}
          isDoctor={isDoctor}
          statusLabels={{ PENDING: t("pending"), CONFIRMED: t("confirmed"), CANCELLED: t("cancelled"), ARRIVED: t("arrived"), MISSED: t("missed"), POSTPONED: t("postponed") }}
          statusColors={statusColors}
          loading={loading}
          onConfirm={(id) => updateStatus(id, "CONFIRMED")}
          onArrived={(id) => updateStatus(id, "ARRIVED")}
          onMissed={(id) => updateStatus(id, "MISSED")}
          onCancel={(id) => handleCancelClick(id)}
          onDelete={(id) => deleteAppointment(id)}
          onComment={(id) => { setCommentModal({ id }); setCommentText(""); }}
        />
      ) : (
      <div className="overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#e5e7eb" }}>
              <th className="p-3 font-semibold">{t("table_date")}</th>
              <th className="p-3 font-semibold">{t("table_time")}</th>
              <th className="p-3 font-semibold">{t("table_patient")}</th>
              <th className="p-3 font-semibold">{t("table_phone")}</th>
              <th className="p-3 font-semibold">{t("table_city")}</th>
              <th className="p-3 font-semibold">{t("table_status")}</th>
              <th className="p-3 font-semibold">{t("table_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {pagedItems.map((a) => {
              const noShow = isNoShow(a);
              return (
                <tr
                  key={a.id}
                  className="border-b transition-colors"
                  style={{
                    borderColor: "#e5e7eb",
                    backgroundColor: noShow ? "#fff5f5" : a.arrivedAt ? "#f0f7ff" : "transparent",
                  }}
                >
                  <td className="p-3">{new Date(a.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3">{a.patientName}</td>
                  <td className="p-3">{a.phone}</td>
                  <td className="p-3">{a.city || "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: statusColors[a.status] || "#f3f4f6" }}>
                        {t(a.status.toLowerCase())}
                      </span>
                      {noShow && (
                        <span className="rounded-full bg-red-200 px-2 py-1 text-xs font-medium text-red-800">
                          {t("no_show")}
                        </span>
                      )}
                      {a.arrivedAt && (
                        <span className="text-[10px] opacity-50">
                          {new Date(a.arrivedAt).toLocaleTimeString(locale === "ar" ? "ar-SA" : "fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    {a.cancelComment && (
                      <p className="mt-1 max-w-[200px] truncate text-[11px] opacity-60" title={a.cancelComment}>
                        {a.cancelComment}
                      </p>
                    )}
                    {a.postponedToDate && (
                      <p className="mt-1 text-[11px] opacity-60">
                        {t("postponed_to")} {new Date(a.postponedToDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "fr-FR")}
                      </p>
                    )}
                    {a.comments && a.comments.length > 0 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-[11px] font-medium opacity-70 hover:opacity-100">
                          💬 {a.comments.length} {t("comments_count")}
                        </summary>
                        {a.comments.map((c) => (
                          <p key={c.id} className="mt-1 rounded bg-gray-50 p-1 text-[11px] opacity-70">
                            <span className="font-medium">{c.username}</span>: {c.comment}
                          </p>
                        ))}
                      </details>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {canAct && a.status === "PENDING" && (
                        <button onClick={() => updateStatus(a.id, "CONFIRMED")} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#10b981" }}>
                          {t("confirm_btn")}
                        </button>
                      )}
                      {canAct && a.status === "CONFIRMED" && (
                        <button onClick={() => updateStatus(a.id, "ARRIVED")} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#3b82f6" }}>
                          {t("arrived_btn")}
                        </button>
                      )}
                      {canAct && a.status === "CONFIRMED" && (
                        <button onClick={() => updateStatus(a.id, "MISSED")} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#ef4444" }}>
                          {t("missed_btn")}
                        </button>
                      )}
                      {canAct && a.status === "CONFIRMED" && (
                        <button onClick={() => { setPostponeModal({ id: a.id }); setPostponeDate(""); }} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                          {t("postpone_btn")}
                        </button>
                      )}
                      {canAct && a.status !== "CANCELLED" && a.status !== "ARRIVED" && a.status !== "MISSED" && a.status !== "POSTPONED" && (
                        <button onClick={() => handleCancelClick(a.id)} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                          {t("cancel_btn")}
                        </button>
                      )}
                      {canAct && (
                        <button onClick={() => deleteAppointment(a.id)} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#ef4444" }}>
                          {t("delete_btn")}
                        </button>
                      )}
                      {isDoctor && (
                        <button onClick={() => { setCommentModal({ id: a.id }); setCommentText(""); }} disabled={loading === a.id} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#8b5cf6" }}>
                          {t("comment_btn")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {viewMode === "table" && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            {t("prev_page")}
          </button>
          <span className="text-sm opacity-70">
            {t("page_of", { page: safePage, total: totalPages })}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-30"
            style={{ backgroundColor: "#f3f4f6" }}
          >
            {t("next_page")}
          </button>
        </div>
      )}

      {cancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCancelModal(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("cancel_comment_label")}</h3>
            <textarea
              value={cancelComment}
              onChange={(e) => setCancelComment(e.target.value)}
              placeholder={t("cancel_comment_placeholder")}
              rows={3}
              className="mb-4 w-full resize-none rounded-lg border p-3 outline-none transition-colors focus:border-2"
              style={{ borderColor: "#d1d5db" }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                Annuler
              </button>
              <button onClick={handleCancelConfirm} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                {t("cancel_comment_submit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {commentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setCommentModal(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("comment_for_secretary")}</h3>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t("comment_placeholder")}
              rows={4}
              className="mb-4 w-full resize-none rounded-lg border p-3 outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCommentModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                {t("cancel")}
              </button>
              <button onClick={submitComment} disabled={!commentText.trim()} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#8b5cf6" }}>
                {t("send_comment")}
              </button>
            </div>
          </div>
        </div>
      )}

      {postponeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPostponeModal(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("postpone_modal_title")}</h3>
            <p className="mb-4 text-sm opacity-70">{t("postpone_modal_desc")}</p>
            <input
              type="date"
              value={postponeDate}
              onChange={(e) => setPostponeDate(e.target.value)}
              className="mb-4 w-full rounded-lg border p-3 outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPostponeModal(null)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                {t("cancel")}
              </button>
              <button onClick={handlePostpone} disabled={!postponeDate} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                {t("postpone_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {walkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setWalkinModal(false)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("walkin_title")}</h3>
            <div className="space-y-3">
              <input
                value={walkinForm.patientName}
                onChange={(e) => setWalkinForm({ ...walkinForm, patientName: e.target.value })}
                placeholder={t("form_name")}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                value={walkinForm.phone}
                onChange={(e) => setWalkinForm({ ...walkinForm, phone: e.target.value })}
                placeholder={t("form_phone")}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                value={walkinForm.email}
                onChange={(e) => setWalkinForm({ ...walkinForm, email: e.target.value })}
                placeholder={t("form_email")}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                value={walkinForm.city}
                onChange={(e) => setWalkinForm({ ...walkinForm, city: e.target.value })}
                placeholder={t("form_city")}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                type="date"
                value={walkinForm.date}
                onChange={(e) => setWalkinForm({ ...walkinForm, date: e.target.value })}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                type="time"
                value={walkinForm.time}
                onChange={(e) => setWalkinForm({ ...walkinForm, time: e.target.value })}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <input
                value={walkinForm.nationalId}
                onChange={(e) => setWalkinForm({ ...walkinForm, nationalId: e.target.value })}
                placeholder={t("form_national_id")}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              />
              <select
                value={walkinForm.consultationType}
                onChange={(e) => setWalkinForm({ ...walkinForm, consultationType: e.target.value })}
                className="w-full rounded-lg border p-2 text-sm outline-none"
                style={{ borderColor: "#d1d5db" }}
              >
                <option value="">{t("form_consultation_type_placeholder")}</option>
                <option value="CONSULTATION">{t("consultation_type_consultation")}</option>
                <option value="ECHO">{t("consultation_type_echo")}</option>
                <option value="FOLLOW_UP">{t("consultation_type_follow_up")}</option>
                <option value="URGENT">{t("consultation_type_urgent")}</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setWalkinModal(false)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                {t("cancel")}
              </button>
              <button onClick={() => addWalkin()} disabled={loading === "walkin" || !walkinForm.patientName || !walkinForm.phone} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>
                {t("walkin_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {walkinDupWarn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" onClick={() => setWalkinDupWarn(null)}>
          <div className="w-full max-w-sm rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-2 text-lg font-semibold" style={{ color: "#f59e0b" }}>⚠️ Patient existant</h3>
            <p className="mb-4 text-sm opacity-80">
              Un patient avec ce numéro existe déjà : <strong>{walkinDupWarn.patientName}</strong> ({walkinDupWarn.phone}).
              Voulez-vous quand même ajouter ce rendez-vous ?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setWalkinDupWarn(null)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">
                Annuler
              </button>
              <button onClick={() => { setWalkinDupWarn(null); addWalkin(true); }} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "#f59e0b" }}>
                Ajouter quand même
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
