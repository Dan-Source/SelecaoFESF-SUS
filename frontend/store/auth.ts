"use client";

import { create } from "zustand";
import { Role } from "@/types/models";

type AuthState = {
  token: string | null;
  role: Role | null;
  setAuth: (token: string, role: Role) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  setAuth: (token, role) => set({ token, role }),
  logout: () => set({ token: null, role: null }),
}));
