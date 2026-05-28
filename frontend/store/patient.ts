"use client";

import { create } from "zustand";

type Appointment = {
  id: number;
  slot_id: number;
  patient_id: number;
  dentist_id: number;
  created_at: string;
};

type PatientState = {
  appointments: Appointment[];
  setAppointments: (appointments: Appointment[]) => void;
};

export const usePatientStore = create<PatientState>((set) => ({
  appointments: [],
  setAppointments: (appointments) => set({ appointments }),
}));
