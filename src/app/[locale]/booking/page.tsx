"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { CalendarPicker } from "@/components/booking/CalendarPicker";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";

export default function BookingPage() {
  const locale = useLocale();
  const t = useTranslations("booking");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleDateSelect = useCallback(async (d: string) => {
    setDate(d);
    setTime(null);
    setSlotsLoading(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/slots?date=${d}`);
      if (!res.ok) throw new Error("Failed to load slots");
      const data = await res.json();
      setSlots(data.slots);
      setStep(2);
    } catch {
      setSubmitError(t("slot_unavailable"));
    } finally {
      setSlotsLoading(false);
    }
  }, [t]);

  const handleSubmit = useCallback(async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t("form_name_error");
    if (!phone.trim() || phone.trim().length < 7) errs.phone = t("form_phone_error");
    if (!city.trim()) errs.city = t("form_city_error");
    if (!consent) errs.consent = t("form_consent_error");
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, patientName: name.trim(), phone: phone.trim(), email: email.trim() || undefined, city: city.trim() || undefined, notes: notes.trim() || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error === "SLOT_UNAVAILABLE" ? "conflict" : "generic");
      }

      const params = new URLSearchParams({ date: date!, time: time! });
      router.push(`${locale === "fr" ? "" : `/${locale}`}/booking/confirm?${params}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setSubmitError(msg === "conflict" ? t("conflict_error") : t("slot_unavailable"));
    } finally {
      setSubmitting(false);
    }
  }, [name, phone, email, city, notes, date, time, t, router, locale]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-center text-3xl font-bold" style={{ color: "var(--color-primary-dark)" }}>
        {t("title")}
      </h1>

      {submitError && (
        <div className="mb-6 rounded-xl p-4 text-center text-sm text-red-700" style={{ backgroundColor: "#fef2f2" }}>
          {submitError}
        </div>
      )}

      <div className="mb-8 flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${step >= s ? "" : "opacity-30"}`} style={{ backgroundColor: step >= s ? "var(--color-primary)" : "#ccc" }}>
              {s}
            </div>
            {s < 3 && <div className="h-0.5 w-8" style={{ backgroundColor: step > s ? "var(--color-primary)" : "#ccc" }} />}
          </div>
        ))}
      </div>

      {step >= 1 && (
        <div className="mb-8">
          <h2 className="mb-4 text-center text-xl font-semibold">{t("step1_title")}</h2>
          <CalendarPicker selected={date} onSelect={handleDateSelect} />
        </div>
      )}

      {step >= 2 && (
        <div className="mb-8">
          <h2 className="mb-4 text-center text-xl font-semibold">{t("step2_title")}</h2>
          <TimeSlotPicker slots={slots} selected={time} onSelect={(t) => { setTime(t); setStep(3); }} loading={slotsLoading} />
        </div>
      )}

      {step >= 3 && time && (
        <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: "#fff" }}>
          <h2 className="mb-4 text-center text-xl font-semibold">{t("step3_title")}</h2>
          <p className="mb-4 text-center text-sm opacity-60">
            {t("slot_selected")} : {date} à {time}
          </p>

          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("form_name")}
                className="w-full rounded-lg border p-3 outline-none transition-colors focus:border-2"
                style={{ borderColor: errors.name ? "#ef4444" : "#d1d5db", ...(errors.name ? { borderColor: "#ef4444" } : {}) }}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>
            <div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("form_phone")}
                className="w-full rounded-lg border p-3 outline-none transition-colors focus:border-2"
                style={{ borderColor: errors.phone ? "#ef4444" : "#d1d5db" }}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("form_email")}
                className="w-full rounded-lg border p-3 outline-none transition-colors focus:border-2"
                style={{ borderColor: "#d1d5db" }}
              />
            </div>
            <div>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("form_city")}
                className="w-full rounded-lg border p-3 outline-none transition-colors focus:border-2"
                style={{ borderColor: errors.city ? "#ef4444" : "#d1d5db" }}
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>
            <div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("form_notes")}
                rows={3}
                className="w-full resize-none rounded-lg border p-3 outline-none transition-colors focus:border-2"
                style={{ borderColor: "#d1d5db" }}
              />
            </div>

            <label className="flex items-start gap-2 text-xs opacity-70">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
              <span>{t("form_consent")} <Link href="/privacy" className="underline">{t("form_consent_link")}</Link></span>
            </label>
            {errors.consent && <p className="text-xs text-red-500">{errors.consent}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-lg px-6 py-3 font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {submitting ? "..." : t("form_submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
