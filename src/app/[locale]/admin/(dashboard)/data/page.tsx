"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AdminDataPage() {
  const t = useTranslations("admin");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    try {
      const res = await fetch(`/api/admin/export/${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "sql" ? "sql" : "xlsx";
      a.download = `cabinet-export.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();
      setImportResult(data.message || data.error || "Import done");
    } catch {
      setImportResult("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleClear = async () => {
    if (!confirm(t("clear_db_confirm"))) return;
    setClearing(true);
    setClearResult(null);
    try {
      const res = await fetch("/api/admin/clear-db", { method: "POST" });
      const data = await res.json();
      setClearResult(data.message || data.error || "Cleared");
    } catch {
      setClearResult("Error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("data_title")}
      </h1>

      <div className="mb-8 rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
          {t("export_data")}
        </h2>
        <p className="mb-4 text-sm opacity-60">{t("export_desc")}</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleExport("excel")} className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "var(--color-primary)" }}>
            {t("export_excel")}
          </button>
          <button onClick={() => handleExport("sql")} className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#6b7280" }}>
            {t("export_sql")}
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "var(--color-primary-dark)" }}>
          {t("import_data")}
        </h2>
        <p className="mb-4 text-sm opacity-60">{t("import_desc")}</p>
        <label className="inline-block cursor-pointer rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: "#8b5cf6" }}>
          {importing ? t("importing") : t("import_btn")}
          <input type="file" accept=".xlsx,.xls,.sql,.json" onChange={handleImport} className="hidden" disabled={importing} />
        </label>
        {importResult && (
          <p className="mt-3 text-sm" style={{ color: importResult.includes("failed") || importResult.includes("Failed") || importResult.includes("Error") ? "#ef4444" : "#10b981" }}>
            {importResult}
          </p>
        )}
      </div>

      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
        <h2 className="mb-4 text-lg font-semibold" style={{ color: "#dc2626" }}>
          {t("clear_db")}
        </h2>
        <p className="mb-4 text-sm opacity-60">{t("clear_db_desc")}</p>
        <button onClick={handleClear} disabled={clearing} className="rounded-lg px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: "#dc2626" }}>
          {clearing ? t("clearing") : t("clear_db_btn")}
        </button>
        {clearResult && (
          <p className="mt-3 text-sm" style={{ color: clearResult.includes("failed") || clearResult.includes("Error") || clearResult.includes("error") ? "#ef4444" : "#10b981" }}>
            {clearResult}
          </p>
        )}
      </div>
    </div>
  );
}
