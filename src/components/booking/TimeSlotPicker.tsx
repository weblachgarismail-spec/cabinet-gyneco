"use client";

import { useLocale } from "next-intl";

type Props = {
  slots: string[];
  selected: string | null;
  onSelect: (time: string) => void;
  loading: boolean;
};

export function TimeSlotPicker({ slots, selected, onSelect, loading }: Props) {
  const locale = useLocale();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (slots.length === 0) {
    return <p className="py-8 text-center opacity-60">{locale === "ar" ? "لا توجد أوقات متاحة" : "Aucun créneau disponible"}</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((time) => (
        <button
          key={time}
          onClick={() => onSelect(time)}
          className="rounded-lg px-3 py-2 text-sm font-medium transition-all"
          style={{
            backgroundColor: selected === time ? "var(--color-primary)" : "#f3f4f6",
            color: selected === time ? "#fff" : "var(--color-text)",
          }}
        >
          {time}
        </button>
      ))}
    </div>
  );
}
