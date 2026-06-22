"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { quickActions } from "@/data/chatbot-knowledge";

type Message = {
  role: "user" | "bot";
  text: string;
};

export function ChatBot({ triggerRef }: { triggerRef?: React.RefObject<HTMLButtonElement | null> }) {
  const locale = useLocale();
  const t = useTranslations("chat");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: t("welcome") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!triggerRef) return;
    const el = triggerRef.current;
    if (!el) return;
    const handler = () => setOpen((v) => !v);
    el.addEventListener("click", handler);
    return () => el.removeEventListener("click", handler);
  }, [triggerRef]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), locale }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.response || t("error") },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: t("error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-6 left-6 z-50 flex w-80 flex-col rounded-xl shadow-xl sm:w-96"
          style={{ backgroundColor: "#fff", maxHeight: "500px" }}
        >
          <div className="flex items-center justify-between rounded-t-xl px-4 py-3 text-white" style={{ backgroundColor: "var(--color-primary, #8B5CF6)" }}>
            <span className="font-semibold">{t("title")}</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">&times;</button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "350px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "text-white"
                      : "text-gray-800"
                  }`}
                  style={{
                    backgroundColor: m.role === "user" ? "var(--color-primary, #8B5CF6)" : "#f3f4f6",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-500">...</div>
              </div>
            )}
            <div ref={endRef} />
          </div>
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 border-t px-4 py-3" style={{ borderColor: "#e5e7eb" }}>
              {quickActions.map((a) => (
                <button
                  key={a.query}
                  onClick={() => send(a.query)}
                  className="rounded-full px-3 py-1 text-xs transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                >
                  {locale === "ar" ? a.labelAr : a.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: "#e5e7eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={t("placeholder")}
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading}
              className="rounded-lg px-3 py-2 text-sm text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary, #8B5CF6)" }}
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
