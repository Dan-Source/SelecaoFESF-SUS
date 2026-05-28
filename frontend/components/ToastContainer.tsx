"use client";

import { useEffect } from "react";
import { useToastStore } from "@/store/toast";

export function ToastContainer() {
  const { toasts, remove } = useToastStore((state) => ({
    toasts: state.toasts,
    remove: state.remove,
  }));

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        remove(toast.id);
      }, 3000)
    );

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, remove]);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          <p>{toast.title}</p>
          <button type="button" className="toast-close" aria-label="Fechar notificacao" onClick={() => remove(toast.id)}>
            x
          </button>
        </div>
      ))}
    </div>
  );
}