"use client";

import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { quickActions } from "@/data/chatbot-knowledge";

type Message = {
  role: "user" | "bot";
  text: string;
};

export function ChatBot() {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text:
        locale === "ar"
          ? "مرحباً! أنا المساعد الافتراضي للعيادة. كيف يمكنني مساعدتك؟"
          : "Bonjour ! Je suis l'assistant virtuel du cabinet. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
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
      if (res.ok) {
        const data = await res.json();
        const botMsg: Message = { role: "bot", text: data.response };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text:
            locale === "ar"
              ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
              : "Désolé, une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isAr = locale === "ar";

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 left-6 z-50 flex w-80 flex-col rounded-2xl shadow-2xl"
          style={{ backgroundColor: "#fff", maxHeight: "500px", height: "500px" }}
        >
          <div className="flex items-center justify-between rounded-t-2xl px-4 py-3 text-white" style={{ backgroundColor: "var(--color-primary, #8B5CF6)" }}>
            <span className="text-sm font-semibold">
              {isAr ? "المساعد الافتراضي" : "Assistant Virtuel"}
            </span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ scrollbarWidth: "thin" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "text-white"
                      : ""
                  }`}
                  style={{
                    backgroundColor: m.role === "user" ? "var(--color-primary, #8B5CF6)" : "#f3f4f6",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(isAr ? qa.query : qa.query)}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#ede9fe", color: "var(--color-primary, #8B5CF6)" }}
                  >
                    {isAr ? qa.labelAr : qa.label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-gray-100 px-3 py-2 text-sm">
                  <span className="opacity-50">{isAr ? "جارٍ الكتابة..." : "En train d'écrire..."}</span>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t p-3" style={{ borderColor: "#e5e7eb" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(input); }}
              placeholder={isAr ? "اكتب رسالتك..." : "Écrivez votre message..."}
              className="flex-1 rounded-full border px-3 py-2 text-sm outline-none"
              style={{ borderColor: "#d1d5db" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white disabled:opacity-50"
              style={{ backgroundColor: "var(--color-primary, #8B5CF6)" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
        style={{ backgroundColor: "var(--color-primary, #8B5CF6)" }}
        aria-label="Chatbot"
      >
        {open ? (
          <span className="text-xl text-white">✕</span>
        ) : (
          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>
    </>
  );
}
