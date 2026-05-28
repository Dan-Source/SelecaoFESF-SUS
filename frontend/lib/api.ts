import { Appointment, Dentist, Role, Slot } from "@/types/models";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Erro na requisicao");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role: Role;
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(email: string, password: string): Promise<{ access_token: string; token_type: string; role: Role }> {
  const body = new URLSearchParams({ username: email, password });

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail ?? "Falha no login");
  }

  return res.json();
}

export function listDentists(token: string) {
  return request<Dentist[]>("/patients/dentists", { method: "GET" }, token);
}

export function listDentistFreeSlots(dentistId: number, token: string) {
  return request<Slot[]>(`/patients/dentists/${dentistId}/slots`, { method: "GET" }, token);
}

export function createAppointment(slotId: number, token: string) {
  return request<Appointment>(
    "/patients/me/appointments",
    { method: "POST", body: JSON.stringify({ slot_id: slotId }) },
    token
  );
}

export function listMyAppointments(token: string) {
  return request<Appointment[]>(
    "/patients/me/appointments",
    { method: "GET" },
    token
  );
}

export function cancelAppointment(appointmentId: number, token: string) {
  return request<void>(`/patients/me/appointments/${appointmentId}`, { method: "DELETE" }, token);
}

export function createSlot(startTime: string, endTime: string, token: string) {
  return request<Slot>(
    "/dentists/me/slots",
    { method: "POST", body: JSON.stringify({ start_time: startTime, end_time: endTime }) },
    token
  );
}

export function listMySlots(token: string) {
  return request<Slot[]>(
    "/dentists/me/slots",
    { method: "GET" },
    token
  );
}

export function deleteSlot(slotId: number, token: string) {
  return request<void>(`/dentists/me/slots/${slotId}`, { method: "DELETE" }, token);
}

export function listDentistAppointments(token: string) {
  return request<Appointment[]>(
    "/dentists/me/appointments",
    { method: "GET" },
    token
  );
}
