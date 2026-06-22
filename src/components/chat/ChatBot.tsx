"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { quickActions } from "@/data/chatbot-knowledge";
import type { ChatContext } from "@/lib/chatbot";

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
  const [context, setContext] = useState<ChatContext>({ lastIntentId: null });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const hasUserMessage = messages.length > 1;

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
        body: JSON.stringify({ message: text.trim(), locale, context }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: data.response || t("error") },
      ]);
      setSuggestions(data.suggestions ?? []);
      setContext(data.context ?? { lastIntentId: null });
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: t("error") }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([{ role: "bot", text: t("welcome") }]);
    setContext({ lastIntentId: null });
    setSuggestions([]);
  };

  return (
    <>
      {open && (
        <div
          className="fixed bottom-6 left-6 z-50 flex w-80 flex-col rounded-xl shadow-xl sm:w-96"
          style={{ backgroundColor: "#fff", maxHeight: "560px" }}
        >
          <div className="flex items-center justify-between rounded-t-xl px-4 py-3 text-white" style={{ backgroundColor: "var(--color-primary)" }}>
            <span className="font-semibold">{t("title")}</span>
            <div className="flex items-center gap-2">
              {hasUserMessage && (
                <button onClick={resetChat} className="text-xs text-white/70 hover:text-white" title="Nouvelle discussion">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">&times;</button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "350px" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user" ? "text-white" : "text-gray-800"
                  }`}
                  style={{
                    backgroundColor: m.role === "user" ? "var(--color-primary)" : "#f3f4f6",
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
            {suggestions.length > 0 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full px-3 py-1 text-xs transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "oklch(55% 0.15 340 / 0.1)", color: "var(--color-primary)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {suggestions.length === 0 && messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
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
            <div ref={endRef} />
          </div>
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
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {t("send")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
