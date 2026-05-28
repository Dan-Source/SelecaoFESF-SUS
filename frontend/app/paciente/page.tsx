"use client";

import { useEffect, useState } from "react";
import {
  cancelAppointment,
  createAppointment,
  listDentists,
  listDentistFreeSlots,
  listMyAppointments,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { usePatientStore } from "@/store/patient";

type Dentist = { id: number; name: string; email: string; role: "patient" | "dentist" };
type Slot = { id: number; dentist_id: number; start_time: string; end_time: string; available: boolean };

export default function PacientePage() {
  const { token, role, logout } = useAuthStore();
  const { appointments, setAppointments } = usePatientStore();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function refreshAppointments() {
    if (!token) return;
    const data = await listMyAppointments(token);
    setAppointments(data);
  }

  async function loadDentists() {
    if (!token) return;
    const data = await listDentists(token);
    setDentists(data);
  }

  async function loadSlots(dentistId: number) {
    if (!token) return;
    const data = await listDentistFreeSlots(dentistId, token);
    setSlots(data);
  }

  useEffect(() => {
    if (!token || role !== "patient") {
      setMessage("Faca login como paciente.");
      return;
    }

    loadDentists().catch((error) => setMessage(error.message));
    refreshAppointments().catch((error) => setMessage(error.message));
  }, [token, role]);

  if (!token || role !== "patient") {
    return (
      <main>
        <h1>Area do Paciente</h1>
        <p>{message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Area do Paciente</h1>
      <button
        className="secondary"
        onClick={() => {
          logout();
          setMessage("Sessao encerrada.");
        }}
      >
        Sair
      </button>

      <section className="card">
        <h2>Odontologos</h2>
        {dentists.map((dentist) => (
          <div key={dentist.id} className="row">
            <span>{dentist.name}</span>
            <button
              onClick={() => {
                setSelectedDentist(dentist.id);
                loadSlots(dentist.id).catch((error) => setMessage(error.message));
              }}
            >
              Ver horarios livres
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Horarios livres {selectedDentist ? `(odontologo ${selectedDentist})` : ""}</h2>
        {slots.map((slot) => (
          <div key={slot.id} className="row">
            <span>
              {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
            </span>
            <button
              onClick={async () => {
                try {
                  await createAppointment(slot.id, token);
                  setMessage("Consulta agendada.");
                  if (selectedDentist) {
                    await loadSlots(selectedDentist);
                  }
                  await refreshAppointments();
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Erro ao agendar");
                }
              }}
            >
              Marcar consulta
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Minhas consultas</h2>
        {appointments.map((appointment) => (
          <div key={appointment.id} className="row">
            <span>
              Consulta #{appointment.id} - Slot #{appointment.slot_id}
            </span>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await cancelAppointment(appointment.id, token);
                  setMessage("Consulta cancelada.");
                  await refreshAppointments();
                  if (selectedDentist) {
                    await loadSlots(selectedDentist);
                  }
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Erro ao cancelar");
                }
              }}
            >
              Cancelar
            </button>
          </div>
        ))}
      </section>

      <p>{message}</p>
    </main>
  );
}
