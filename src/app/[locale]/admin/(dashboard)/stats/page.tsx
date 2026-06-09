"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type StatsData = {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  weekAppointments: number;
  statusCounts: { status: string; count: number }[];
  topActTypes: { actType: string; count: number }[];
  recentPatients: { id: string; patientName: string; phone: string; createdAt: string }[];
  recentAppointments: { id: string; patientName: string; date: string; time: string; status: string; createdAt: string }[];
};

export default function StatsPage() {
  const t = useTranslations("admin");
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center opacity-50">{t("loading")}</div>;
  if (!data) return <div className="p-8 text-center text-red-500">{t("error")}</div>;

  const totalByStatus = data.statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s.count }), {} as Record<string, number>);

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("stats_title")}
      </h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stats_patients")} value={data.totalPatients} />
        <StatCard label={t("stats_appointments")} value={data.totalAppointments} />
        <StatCard label={t("stats_today")} value={data.todayAppointments} />
        <StatCard label={t("stats_week")} value={data.weekAppointments} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
            {t("stats_by_status")}
          </h2>
          <div className="space-y-3">
            {["CONFIRMED", "ARRIVED", "CANCELLED", "MISSED", "PENDING", "POSTPONED"].map((status) => {
              const count = totalByStatus[status] || 0;
              const max = Math.max(...data.statusCounts.map((s) => s.count), 1);
              return (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{t(`status_${status}`)}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ backgroundColor: "#f3f4f6" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / max) * 100}%`,
                        backgroundColor: status === "CANCELLED" ? "#ef4444" : status === "ARRIVED" ? "#10b981" : status === "CONFIRMED" ? "#3b82f6" : "#f59e0b",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
            {t("stats_top_acts")}
          </h2>
          <div className="space-y-3">
            {data.topActTypes.map((act) => (
              <div key={act.actType}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t(`act_${act.actType}`)}</span>
                  <span className="font-semibold">{act.count}</span>
                </div>
                <div className="h-2 w-full rounded-full" style={{ backgroundColor: "#f3f4f6" }}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${(act.count / Math.max(...data.topActTypes.map((a) => a.count), 1)) * 100}%`,
                      backgroundColor: "var(--color-primary, #8B5CF6)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
            {t("stats_recent_patients")}
          </h2>
          <div className="space-y-2">
            {data.recentPatients.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#f9fafb" }}>
                <div>
                  <div className="text-sm font-medium">{p.patientName}</div>
                  <div className="text-xs opacity-50">{p.phone}</div>
                </div>
                <div className="text-xs opacity-50">{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
            {t("stats_recent_appointments")}
          </h2>
          <div className="space-y-2">
            {data.recentAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: "#f9fafb" }}>
                <div>
                  <div className="text-sm font-medium">{a.patientName}</div>
                  <div className="text-xs opacity-50">{new Date(a.date).toLocaleDateString()} {a.time}</div>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.status === "CANCELLED" ? "text-red-600" : a.status === "ARRIVED" ? "text-green-600" : "text-blue-600"}`} style={{ backgroundColor: a.status === "CANCELLED" ? "#fef2f2" : a.status === "ARRIVED" ? "#f0fdf4" : "#eff6ff" }}>
                  {t(`status_${a.status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md" style={{ backgroundColor: "#fff" }}>
      <div className="text-sm opacity-60">{label}</div>
      <div className="mt-1 text-3xl font-bold" style={{ color: "var(--color-primary, #8B5CF6)" }}>
        {value}
      </div>
    </div>
  );
}
