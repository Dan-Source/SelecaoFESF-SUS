"use client";

import { create } from "zustand";
import { Slot } from "@/types/models";

type DentistState = {
  slots: Slot[];
  setSlots: (slots: Slot[]) => void;
};

export const useDentistStore = create<DentistState>((set) => ({
  slots: [],
  setSlots: (slots) => set({ slots }),
}));
