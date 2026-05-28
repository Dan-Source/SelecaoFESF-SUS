"use client";

import { create } from "zustand";

type Slot = {
  id: number;
  dentist_id: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

type DentistState = {
  slots: Slot[];
  setSlots: (slots: Slot[]) => void;
};

export const useDentistStore = create<DentistState>((set) => ({
  slots: [],
  setSlots: (slots) => set({ slots }),
}));
