"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

const styleId = "toast-keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `@keyframes toast-slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`;
  document.head.appendChild(style);
}

type ToastType = "success" | "error" | "info";
type ToastItem = { id: number; type: ToastType; message: string };

const ToastContext = createContext<{ toast: (type: ToastType, message: string) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = nextId++;
    setItems((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const colors: Record<ToastType, string> = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg px-5 py-3 text-sm font-medium text-white shadow-lg"
            style={{ backgroundColor: colors[item.type], animation: "toast-slide-up 0.3s ease-out" }}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
