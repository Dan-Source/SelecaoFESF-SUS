"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Role } from "@/types/models";

type AuthState = {
  token: string | null;
  role: Role | null;
  setAuth: (token: string, role: Role) => void;
  logout: () => void;
};

const memoryStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      setAuth: (token, role) => set({ token, role }),
      logout: () => set({ token: null, role: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : memoryStorage)),
      partialize: (state) => ({ token: state.token, role: state.role }),
    }
  )
);
