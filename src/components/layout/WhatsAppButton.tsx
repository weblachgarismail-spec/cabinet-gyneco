"use client";

import { useRef } from "react";
import { useLocale } from "next-intl";
import BookingModal from "@/components/BookingModal";

export function WhatsAppButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          ref={btnRef}
          className="group flex items-center gap-2.5 rounded-full px-5 py-3.5 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 4px 20px oklch(55% 0.15 340 / 0.35)",
          }}
          aria-label={isAr ? "احجز موعداً" : "Prendre rendez-vous"}
        >
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-bold tracking-wide text-white">{isAr ? "احجز موعداً" : "Prendre RDV"}</span>
          <span className="text-base leading-none text-white/70 transition-transform duration-300 group-hover:translate-x-0.5">{isAr ? "←" : ">"}</span>
        </button>
        <a
          href="https://wa.me/212661250137?text=Bonjour%2C%20je%20souhaite%20prendre%20rendez-vous%20au%20cabinet%20gyn%C3%A9cologue."
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
          style={{ backgroundColor: "#25D366" }}
          aria-label="WhatsApp"
        >
          <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </a>
      </div>
      <BookingModal triggerRef={btnRef} />
    </>
  );
}
