"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSlot, deleteSlot, listDentistAppointments, listMySlots } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useDentistStore } from "@/store/dentist";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Appointment } from "@/types/models";

export default function OdontologoPage() {
  const { token, role, logout } = useAuthStore();
  const { slots, setSlots } = useDentistStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [slotDate, setSlotDate] = useState("");
  const [slotTime, setSlotTime] = useState("");
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [creatingSlot, setCreatingSlot] = useState(false);
  const [removingSlotId, setRemovingSlotId] = useState<number | null>(null);
  const toast = useToast();

  async function refreshSlots() {
    if (!token) return;
    try {
      setLoadingSlots(true);
      const slotData = await listMySlots(token);
      setSlots(slotData);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function refreshAppointments() {
    if (!token) return;
    try {
      setLoadingAppointments(true);
      const appointmentData = await listDentistAppointments(token);
      setAppointments(appointmentData);
    } finally {
      setLoadingAppointments(false);
    }
  }

  async function refreshData() {
    await Promise.all([refreshSlots(), refreshAppointments()]);
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

    const startDateTime = new Date(`${slotDate}T${slotTime}`);
    if (Number.isNaN(startDateTime.getTime())) {
      setMessage("Informe uma data e horario validos.");
      toast.error("Informe uma data e horario validos.");
      return;
    }

    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    try {
      setCreatingSlot(true);
      await createSlot(startDateTime.toISOString(), endDateTime.toISOString(), token);
      setMessage("Horario criado.");
      toast.success("Horario criado.");
      setSlotDate("");
      setSlotTime("");
      setShowSlotForm(false);
      await refreshData();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Erro ao criar horario";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      setCreatingSlot(false);
    }
  }

  const slotById = new Map(slots.map((slot) => [slot.id, slot]));

  if (!token || role !== "dentist") {
    return (
      <main className="page-wrap">
        <h1>Area do Odontologo</h1>
        <Alert variant="warning">{message}</Alert>
      </main>
    );
  }

  return (
    <main className="page-wrap dentist-page">
      <section className="dentist-topbar">
        <div>
          <h1>Ola, doutor(a)! 👨‍⚕️</h1>
          <p className="muted">Gerencie horarios livres e acompanhe consultas vinculadas.</p>
        </div>
      </section>

      <Card title="📊 Resumo">
        <div className="dentist-summary-grid">
          <article className="summary-tile">
            <p className="muted">Total de horarios</p>
            <strong>{slots.length}</strong>
          </article>
          <article className="summary-tile">
            <p className="muted">Consultas agendadas</p>
            <strong>{appointments.length}</strong>
          </article>
        </div>
      </Card>

      <Card
        title="🕐 Meus horarios"
        actions={
          <Button type="button" variant="secondary" onClick={() => setShowSlotForm(true)}>
            + Novo horario
          </Button>
        }
      >
        {loadingSlots ? <Spinner label="Atualizando horarios" /> : null}

        {!loadingSlots && slots.length === 0 ? <p className="muted">Nenhum horario cadastrado ainda.</p> : null}

        <div className="dentist-slot-table">
          {!loadingSlots && slots.length > 0 ? (
            <div className="dentist-slot-head">
              <span>Data</span>
              <span>Hora</span>
              <span>Status</span>
              <span>Acoes</span>
            </div>
          ) : null}

          {slots.map((slot) => (
            <article key={slot.id} className="dentist-slot-row">
              <span>{new Date(slot.start_time).toLocaleDateString()}</span>
              <span>{new Date(slot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <Badge variant={slot.available ? "available" : "booked"}>{slot.available ? "🟢 Livre" : "🔴 Ocupado"}</Badge>
              <div>
                {slot.available ? (
                  <Button
                    variant="danger"
                    loading={removingSlotId === slot.id}
                    onClick={async () => {
                      if (!window.confirm("Tem certeza que deseja remover este horario?")) {
                        return;
                      }

                      try {
                        setRemovingSlotId(slot.id);
                        await deleteSlot(slot.id, token);
                        setMessage("Horario removido.");
                        toast.warning("Horario removido.");
                        await refreshData();
                      } catch (error) {
                        const nextMessage = error instanceof Error ? error.message : "Erro ao remover horario";
                        setMessage(nextMessage);
                        toast.error(nextMessage);
                      } finally {
                        setRemovingSlotId(null);
                      }
                    }}
                  >
                    🗑️ Remover
                  </Button>
                ) : (
                  <span className="muted">Com consulta</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Card>

      <Card title="📋 Consultas vinculadas">
        {loadingAppointments ? <Spinner label="Carregando consultas" /> : null}

        {!loadingAppointments && appointments.length === 0 ? (
          <p className="muted">Voce ainda nao possui consultas vinculadas.</p>
        ) : null}

        <div className="dentist-appointment-table">
          {!loadingAppointments && appointments.length > 0 ? (
            <div className="dentist-slot-head">
              <span>Data</span>
              <span>Hora</span>
              <span>Paciente</span>
              <span>Status</span>
            </div>
          ) : null}

          {appointments.map((appointment) => {
            const appointmentSlot = slotById.get(appointment.slot_id);
            const startTime = appointmentSlot?.start_time ?? appointment.created_at;

            return (
              <article key={appointment.id} className="dentist-slot-row">
                <span>{new Date(startTime).toLocaleDateString()}</span>
                <span>{new Date(startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                <span>Paciente #{appointment.patient_id}</span>
                <Badge variant="info">Agendada</Badge>
              </article>
            );
          })}
        </div>
      </Card>

      {showSlotForm ? (
        <div className="dentist-modal-backdrop" role="dialog" aria-modal="true" aria-label="Novo horario">
          <div className="dentist-modal">
            <div className="dentist-modal-header">
              <h2>➕ Novo Horário</h2>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSlotForm(false);
                  setSlotDate("");
                  setSlotTime("");
                }}
              >
                X
              </Button>
            </div>

            <form onSubmit={onCreateSlot} className="form-grid dentist-slot-form">
              <Input
                id="slotDate"
                name="slotDate"
                type="date"
                label="Data"
                required
                value={slotDate}
                onChange={(event) => setSlotDate(event.target.value)}
              />
              <Input
                id="slotTime"
                name="slotTime"
                type="time"
                label="Horário"
                required
                value={slotTime}
                onChange={(event) => setSlotTime(event.target.value)}
              />

              <div className="dentist-modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSlotForm(false);
                    setSlotDate("");
                    setSlotTime("");
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" loading={creatingSlot}>
                  Criar ✓
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {message ? <Alert variant="info">{message}</Alert> : null}
    </main>
  );
}
