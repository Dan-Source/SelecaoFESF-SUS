"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSlot, deleteSlot, listDentistAppointments, listMySlots } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useDentistStore } from "@/store/dentist";

type Appointment = {
  id: number;
  slot_id: number;
  patient_id: number;
  dentist_id: number;
  created_at: string;
};

export default function OdontologoPage() {
  const { token, role, logout } = useAuthStore();
  const { slots, setSlots } = useDentistStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  async function refreshData() {
    if (!token) return;
    const [slotData, appointmentData] = await Promise.all([
      listMySlots(token),
      listDentistAppointments(token),
    ]);
    setSlots(slotData);
    setAppointments(appointmentData);
  }

  useEffect(() => {
    if (!token || role !== "dentist") {
      setMessage("Faca login como odontologo.");
      return;
    }

    refreshData().catch((error) => setMessage(error.message));
  }, [token, role]);

  async function onCreateSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const start = String(formData.get("start"));
    const end = String(formData.get("end"));

    try {
      await createSlot(new Date(start).toISOString(), new Date(end).toISOString(), token);
      setMessage("Horario criado.");
      form.reset();
      await refreshData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao criar horario");
    }
  }

  if (!token || role !== "dentist") {
    return (
      <main>
        <h1>Area do Odontologo</h1>
        <p>{message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Area do Odontologo</h1>
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
        <h2>Criar horario disponivel</h2>
        <form onSubmit={onCreateSlot} className="row">
          <input name="start" type="datetime-local" required />
          <input name="end" type="datetime-local" required />
          <button type="submit">Criar</button>
        </form>
      </section>

      <section className="card">
        <h2>Meus horarios</h2>
        {slots.map((slot) => (
          <div key={slot.id} className="row">
            <span>
              {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()} | {slot.available ? "Livre" : "Ocupado"}
            </span>
            <button
              className="secondary"
              onClick={async () => {
                try {
                  await deleteSlot(slot.id, token);
                  setMessage("Horario removido.");
                  await refreshData();
                } catch (error) {
                  setMessage(error instanceof Error ? error.message : "Erro ao remover horario");
                }
              }}
            >
              Deletar
            </button>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>Consultas agendadas comigo</h2>
        {appointments.map((appointment) => (
          <p key={appointment.id}>
            Consulta #{appointment.id} | Paciente #{appointment.patient_id} | Slot #{appointment.slot_id}
          </p>
        ))}
      </section>

      <p>{message}</p>
    </main>
  );
}
