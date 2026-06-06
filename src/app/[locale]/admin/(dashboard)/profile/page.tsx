"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const DEFAULT_COLOR = "#8B5CF6";
const COLORS = [DEFAULT_COLOR, "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#6366F1", "#14B8A6"];

export default function AdminProfilePage() {
  const t = useTranslations("admin");
  const [profile, setProfile] = useState<{ id: string; username: string; displayName: string | null; role: string; themeColor: string | null } | null>(null);
  const [form, setForm] = useState({ displayName: "", themeColor: DEFAULT_COLOR });
  const [pw, setPw] = useState({ current: "", newPw: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/profile").then((r) => r.json()).then((d) => { setProfile(d); setForm({ displayName: d.displayName || "", themeColor: d.themeColor || DEFAULT_COLOR }); });
  }, []);

  const saveProfile = async () => {
    setSaving(true); setMsg("");
    const body: Record<string, unknown> = { displayName: form.displayName || null, themeColor: form.themeColor };
    if (pw.newPw) { body.currentPassword = pw.current; body.newPassword = pw.newPw; }
    const res = await fetch("/api/admin/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setMsg(t("saved")); setPw({ current: "", newPw: "" }); } else { const e = await res.json(); setMsg(e.error || "Error"); }
    setSaving(false);
  };

  if (!profile) return <div className="py-12 text-center opacity-60">{t("loading")}</div>;

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("profile_title")}</h1>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <p className="text-xs opacity-50">{t("table_username")}</p>
          <p className="mt-1 font-medium">{profile.username}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <p className="text-xs opacity-50">{t("table_role")}</p>
          <p className="mt-1 font-medium">{t(`role_${(profile.role || "secretary").toLowerCase()}`)}</p>
        </div>
        <div className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <p className="text-xs opacity-50">{t("table_display_name")}</p>
          <p className="mt-1 font-medium">{profile.displayName || "—"}</p>
        </div>
      </div>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("edit_profile")}</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("form_display_name")}</label>
            <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium opacity-70">{t("theme_color")}</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setForm({ ...form, themeColor: c })} className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: form.themeColor === c ? "#000" : "transparent" }} />
              ))}
              <button onClick={() => setForm({ ...form, themeColor: DEFAULT_COLOR })} className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors hover:opacity-80" style={{ borderColor: "#d1d5db", color: "#6b7280" }}>{t("default_color")}</button>
            </div>
          </div>

          <hr className="opacity-20" />

          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("current_password")}</label>
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium opacity-70">{t("new_password")}</label>
            <input type="password" value={pw.newPw} onChange={(e) => setPw({ ...pw, newPw: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
          </div>

          {msg && <p className="rounded-lg p-2 text-sm" style={{ backgroundColor: msg.includes("Error") || msg.includes("error") || msg.includes("Wrong") ? "#fee2e2" : "#d1fae5" }}>{msg}</p>}

          <button onClick={saveProfile} disabled={saving} className="rounded-lg px-6 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>{t("save")}</button>
        </div>
      </div>
    </div>
  );
}
