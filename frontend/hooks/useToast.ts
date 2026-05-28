"use client";

import { useToastStore } from "@/store/toast";

export function useToast() {
  const push = useToastStore((state) => state.push);

  return {
    success: (title: string) => push({ type: "success", title }),
    error: (title: string) => push({ type: "error", title }),
    warning: (title: string) => push({ type: "warning", title }),
    info: (title: string) => push({ type: "info", title }),
  };
}