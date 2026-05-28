export type Role = "patient" | "dentist";

export type Dentist = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type Slot = {
  id: number;
  dentist_id: number;
  start_time: string;
  end_time: string;
  available: boolean;
};

export type Appointment = {
  id: number;
  slot_id: number;
  patient_id: number;
  dentist_id: number;
  created_at: string;
};