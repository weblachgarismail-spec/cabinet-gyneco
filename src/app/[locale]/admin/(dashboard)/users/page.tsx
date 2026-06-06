"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type User = { id: string; username: string; displayName: string | null; role: string; themeColor: string | null; active: boolean; createdAt: string };

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", password: "", displayName: "", role: "SECRETARY" });

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const createUser = async () => {
    if (!form.username || !form.password) return;
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowCreate(false); setForm({ username: "", password: "", displayName: "", role: "SECRETARY" }); fetchUsers(); }
  };

  const updateUser = async () => {
    if (!editUser) return;
    const body: Record<string, unknown> = { displayName: form.displayName || null, role: form.role };
    if (form.password) body.password = form.password;
    const res = await fetch(`/api/admin/users/${editUser.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setEditUser(null); setForm({ username: "", password: "", displayName: "", role: "SECRETARY" }); fetchUsers(); }
  };

  const deleteUser = async (id: string) => {
    if (!confirm(t("delete_user_confirm"))) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !current }) });
    if (res.ok) fetchUsers();
    else { const data = await res.json(); alert(data.error || "Erreur"); }
  };

  if (loading) return <div className="py-12 text-center opacity-60">{t("loading")}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("users_title")}</h1>
        <button onClick={() => setShowCreate(true)} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>{t("create_user")}</button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: "#fff" }}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "#e5e7eb" }}>
              <th className="p-3 font-semibold">{t("table_username")}</th>
              <th className="p-3 font-semibold">{t("table_display_name")}</th>
              <th className="p-3 font-semibold">{t("table_role")}</th>
              <th className="p-3 font-semibold">{t("table_active")}</th>
              <th className="p-3 font-semibold">{t("table_created")}</th>
              <th className="p-3 font-semibold">{t("table_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b" style={{ borderColor: "#e5e7eb" }}>
                <td className="p-3">{u.username}</td>
                  <td className="p-3">{u.displayName || "—"}</td>
                  <td className="p-3">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: u.role === "SUPER_ADMIN" ? "#fef3c7" : u.role === "DOCTOR" ? "#dbeafe" : "#d1fae5" }}>
                      {t(`role_${u.role.toLowerCase()}`)}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleActive(u.id, u.active)}
                      disabled={u.role === "SUPER_ADMIN"}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-50 ${u.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                    >
                      {u.active ? t("active") : t("inactive")}
                    </button>
                  </td>
                  <td className="p-3 text-xs opacity-60">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditUser(u); setForm({ username: u.username, password: "", displayName: u.displayName || "", role: u.role }); }} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>{t("edit")}</button>
                      {u.role !== "SUPER_ADMIN" && <button onClick={() => deleteUser(u.id)} className="rounded px-2 py-1 text-xs font-medium text-white" style={{ backgroundColor: "#ef4444" }}>{t("delete_btn")}</button>}
                    </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCreate(false)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("create_user")}</h3>
            <div className="space-y-3">
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder={t("form_username")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder={t("form_display_name")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t("form_password")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }}>
                <option value="SECRETARY">{t("role_secretary")}</option>
                <option value="DOCTOR">{t("role_doctor")}</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">{t("cancel")}</button>
              <button onClick={createUser} disabled={!form.username || !form.password} className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor: "var(--color-primary)" }}>{t("create")}</button>
            </div>
          </div>
        </div>
      )}

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditUser(null)}>
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff" }} onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>{t("edit_user")} — {editUser.username}</h3>
            <div className="space-y-3">
              <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder={t("form_display_name")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={t("form_password_blank")} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }} />
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border p-2 text-sm outline-none" style={{ borderColor: "#d1d5db" }}>
                <option value="SECRETARY">{t("role_secretary")}</option>
                <option value="DOCTOR">{t("role_doctor")}</option>
                <option value="SUPER_ADMIN">{t("role_super_admin")}</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setEditUser(null)} className="rounded-lg px-4 py-2 text-sm font-medium opacity-60 hover:opacity-100">{t("cancel")}</button>
              <button onClick={updateUser} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: "var(--color-primary)" }}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
