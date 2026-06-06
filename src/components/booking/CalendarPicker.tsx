"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

type Props = {
  selected: string | null;
  onSelect: (date: string) => void;
};

const DAYS_FR = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];
const DAYS_AR = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];
const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "ماي", "يونيو", "يوليوز", "غشت", "سبتمبر", "أكتوبر", "نونبر", "دجنبر"];

export function CalendarPicker({ selected, onSelect }: Props) {
  const locale = useLocale();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const days = locale === "ar" ? DAYS_AR : DAYS_FR;
  const months = locale === "ar" ? MONTHS_AR : MONTHS_FR;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const adjustedFirstDay = locale === "ar" ? (firstDay + 6) % 7 : firstDay;

  const isPast = (day: number) => {
    const d = new Date(year, month, day);
    const t = new Date();
    return d < new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };

  const isSelected = (day: number) => {
    return selected === `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const handlePrev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  };

  const handleNext = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < adjustedFirstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl p-4 shadow-sm" style={{ backgroundColor: "#fff" }}>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={handlePrev} className="rounded-lg p-2 transition-colors hover:opacity-70" style={{ color: "var(--color-primary)" }} aria-label={locale === "ar" ? "الشهر السابق" : "Mois précédent"}>
          <svg className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-semibold">{months[month]} {year}</span>
        <button onClick={handleNext} className="rounded-lg p-2 transition-colors hover:opacity-70" style={{ color: "var(--color-primary)" }} aria-label={locale === "ar" ? "الشهر التالي" : "Mois suivant"}>
          <svg className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium" style={{ color: "var(--color-primary)" }}>
        {days.map((d) => <div key={d}>{d}</div>)}
      </div>

      {rows.map((row, ri) => (
        <div key={ri} className="grid grid-cols-7 text-center">
          {row.map((cell, ci) => (
            <button
              key={ci}
              disabled={cell === null || isPast(cell)}
              onClick={() => cell && onSelect(`${year}-${String(month + 1).padStart(2, "0")}-${String(cell).padStart(2, "0")}`)}
              className={`p-2 text-sm transition-colors ${cell === null ? "" : "rounded-lg hover:opacity-70"} ${isSelected(cell || 0) ? "text-white" : ""} ${cell && isPast(cell) ? "cursor-not-allowed opacity-30" : "cursor-pointer"}`}
              style={isSelected(cell || 0) ? { backgroundColor: "var(--color-primary)" } : {}}
            >
              {cell || ""}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
