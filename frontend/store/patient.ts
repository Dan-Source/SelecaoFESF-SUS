"use client";

import { create } from "zustand";
import { Appointment } from "@/types/models";

type PatientState = {
  appointments: Appointment[];
  setAppointments: (appointments: Appointment[]) => void;
};

export const usePatientStore = create<PatientState>((set) => ({
  appointments: [],
  setAppointments: (appointments) => set({ appointments }),
}));
