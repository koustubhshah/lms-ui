import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const push = (toast) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const payload = { id, duration: 3000, ...toast };
    setToasts((prev) => [...prev, payload]);
    if (payload.duration > 0) {
      setTimeout(() => remove(id), payload.duration);
    }
    return id;
  };

  const api = useMemo(() => ({
    success: (message) => push({ type: "success", message }),
    error: (message) => push({ type: "error", message }),
    info: (message) => push({ type: "info", message }),
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-[260px] max-w-sm px-4 py-3 rounded-lg shadow border text-sm ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-slate-50 border-slate-200 text-slate-800"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};