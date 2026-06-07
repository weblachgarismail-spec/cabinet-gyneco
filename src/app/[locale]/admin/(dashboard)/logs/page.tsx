"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type LogEntry = { id: string; userId: string; username: string; action: string; entity: string; entityId: string | null; details: string | null; createdAt: string };
type AdminUser = { id: string; username: string; displayName: string | null; role: string };

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT", "IMPORT", "CLEAR"];

const actionColors: Record<string, string> = { CREATE: "#d1fae5", UPDATE: "#dbeafe", DELETE: "#fee2e2", LOGIN: "#fef3c7", EXPORT: "#f3e8ff", IMPORT: "#f3e8ff", CLEAR: "#fecaca" };

export default function AdminLogsPage() {
  const t = useTranslations("admin");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");

  const buildUrl = () => {
    const p = new URLSearchParams();
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    if (timeFrom) p.set("timeFrom", timeFrom);
    if (timeTo) p.set("timeTo", timeTo);
    if (userId) p.set("userId", userId);
    if (action) p.set("action", action);
    const qs = p.toString();
    return `/api/admin/logs${qs ? `?${qs}` : ""}`;
  };

  const fetchLogs = () => {
    setLoading(true);
    fetch(buildUrl()).then((r) => r.json()).then((d) => { setLogs(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    fetch("/api/admin/users").then((r) => r.json()).then((d) => { if (Array.isArray(d)) setUsers(d); }).catch(() => {});
  }, []);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setTimeFrom("");
    setTimeTo("");
    setUserId("");
    setAction("");
  };

  const userOptions = users.filter((u) => u.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("logs_title")}</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_date_from")}</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_date_to")}</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_time_from")}</label>
          <input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_time_to")}</label>
          <input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_profile")}</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }}>
            <option value="">{t("all")}</option>
            {userOptions.map((u) => (
              <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium opacity-70">{t("filter_action")}</label>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }}>
            <option value="">{t("all")}</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <button onClick={fetchLogs} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          {t("filter_apply")}
        </button>
        <button onClick={clearFilters} className="rounded-lg px-4 py-2 text-sm font-medium" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
          {t("clear_filters")}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center opacity-60">{t("loading")}</div>
      ) : logs.length === 0 ? (
        <p className="py-12 text-center opacity-60">{t("logs_empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: "#e5e7eb" }}>
                <th className="p-3 font-semibold">{t("table_logged_at")}</th>
                <th className="p-3 font-semibold">{t("table_username")}</th>
                <th className="p-3 font-semibold">{t("table_action")}</th>
                <th className="p-3 font-semibold">{t("table_entity")}</th>
                <th className="p-3 font-semibold">{t("table_details")}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                  <td className="p-3 text-xs opacity-60">{new Date(l.createdAt).toLocaleString()}</td>
                  <td className="p-3">{l.username}</td>
                  <td className="p-3">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: actionColors[l.action] || "#f3f4f6" }}>
                      {l.action}
                    </span>
                  </td>
                  <td className="p-3 text-xs opacity-70">{l.entity}{l.entityId ? ` #${l.entityId.slice(0, 8)}` : ""}</td>
                  <td className="p-3 max-w-[300px] truncate text-xs opacity-60" title={l.details || ""}>{l.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}