"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { CalendarPicker } from "@/components/booking/CalendarPicker";

type Props = {
  label?: string;
  className?: string;
  icon?: React.ReactNode;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
};

export default function BookingModal({ label, className, icon, triggerRef }: Props) {
  const locale = useLocale();
  const t = useTranslations("booking");
  const [open, setOpen] = useState(false);
  const internalRef = useRef<HTMLButtonElement>(null);
  const btnRef = triggerRef || internalRef;

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const handler = () => setOpen(true);
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [btnRef]);
  const [date, setDate] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = useCallback(() => {
    setDate(null);
    setName("");
    setPhone("");
    setConsent(false);
    setErrors({});
    setDone(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("form_name_error");
    if (!phone.trim() || phone.trim().length < 7) errs.phone = t("form_phone_error");
    if (!consent) errs.consent = t("form_consent_error");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!date) { setErrors({ date: t("form_date_error") }); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, patientName: name.trim(), phone: phone.trim() }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setErrors({ submit: t("slot_unavailable") });
    } finally {
      setSubmitting(false);
    }
  }, [name, phone, consent, date, t]);

  const close = () => { setOpen(false); setTimeout(reset, 300); };

  return (
    <>
      {!triggerRef && (
        <button ref={btnRef as React.RefObject<HTMLButtonElement>} className={className || "btn-primary"}>
          {icon}{label || t("title")}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={close}>
          <div className="relative w-full max-w-lg rounded-2xl border bg-white p-6 shadow-2xl md:p-8" style={{ maxHeight: "90vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={close} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-lg opacity-40 hover:opacity-100" style={{ backgroundColor: "#f3f4f6" }}>✕</button>

            {done ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: "oklch(55% 0.15 340 / 0.1)" }}>✅</div>
                <h3 className="mb-2 text-xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("confirm_title")}</h3>
                <p className="text-sm opacity-70">{t("callback_notice")}</p>
                <button onClick={close} className="btn-primary mt-6">OK</button>
              </div>
            ) : (
              <>
                <h2 className="mb-6 text-center text-xl font-bold" style={{ color: "var(--color-primary-dark)" }}>{t("title")}</h2>

                <div className="mb-6">
                  <p className="mb-3 text-center text-sm font-semibold opacity-70">{t("step1_title")}</p>
                  <CalendarPicker selected={date} onSelect={(d) => { setDate(d); setErrors((e) => ({ ...e, date: "" })); }} />
                </div>

                <div className="space-y-4">
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("form_name")} className="input-modern w-full" style={{ borderColor: errors.name ? "#ef4444" : undefined }} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}

                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("form_phone")} className="input-modern w-full" style={{ borderColor: errors.phone ? "#ef4444" : undefined }} />
                  {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}

                  <label className="flex cursor-pointer items-start gap-2.5 text-xs opacity-70 hover:opacity-100">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 rounded" style={{ accentColor: "var(--color-primary)" }} />
                    <span>{t("form_consent")} <Link href={`/${locale}/privacy`} className="font-medium underline">{t("form_consent_link")}</Link></span>
                  </label>
                  {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}

                  {errors.submit && <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">{errors.submit}</p>}

                  <button onClick={handleSubmit} disabled={submitting || !date} className="btn-primary w-full justify-center text-base">
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        {t("form_submit")}...
                      </span>
                    ) : t("form_submit")}
                  </button>

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
