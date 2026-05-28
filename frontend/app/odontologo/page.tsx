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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      setLoading(true);
      await createSlot(new Date(start).toISOString(), new Date(end).toISOString(), token);
      setMessage("Horario criado.");
      toast.success("Horario criado.");
      form.reset();
      await refreshData();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Erro ao criar horario";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!token || role !== "dentist") {
    return (
      <main className="page-wrap">
        <h1>Area do Odontologo</h1>
        <Alert variant="warning">{message}</Alert>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <h1>Area do Odontologo</h1>
      <Button
        variant="secondary"
        onClick={() => {
          logout();
          setMessage("Sessao encerrada.");
          toast.info("Sessao encerrada.");
        }}
      >
        Sair
      </Button>

      <div className="stats-grid">
        <Card title="Meus horarios">
          <p className="muted">{slots.length} horario(s) cadastrado(s).</p>
        </Card>
        <Card title="Consultas">
          <p className="muted">{appointments.length} consulta(s) vinculada(s).</p>
        </Card>
      </div>

      <Card title="Criar horario disponivel">
        <form onSubmit={onCreateSlot} className="form-grid">
          <Input id="start" name="start" type="datetime-local" label="Inicio" required />
          <Input id="end" name="end" type="datetime-local" label="Fim" required />
          <Button type="submit" loading={loading}>
            Criar
          </Button>
        </form>
      </Card>

      <Card title="Meus horarios">
        {loading ? <Spinner label="Atualizando dados" /> : null}
        <div className="list">
          {slots.map((slot) => (
            <div key={slot.id} className="list-item">
              <span>
                {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
              </span>
              <div className="row">
                <Badge variant={slot.available ? "available" : "booked"}>{slot.available ? "Livre" : "Ocupado"}</Badge>
                <Button
                  variant="danger"
              onClick={async () => {
                if (!window.confirm("Tem certeza que deseja remover este horario?")) {
                  return;
                }

                try {
                  setLoading(true);
                  await deleteSlot(slot.id, token);
                  setMessage("Horario removido.");
                  toast.warning("Horario removido.");
                  await refreshData();
                } catch (error) {
                  const nextMessage = error instanceof Error ? error.message : "Erro ao remover horario";
                  setMessage(nextMessage);
                  toast.error(nextMessage);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Deletar
            </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Consultas agendadas comigo">
        <div className="list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="list-item">
              <span>
                Consulta #{appointment.id} | Paciente #{appointment.patient_id} | Slot #{appointment.slot_id}
              </span>
              <Badge variant="info">Ativo</Badge>
            </div>
          ))}
        </div>
      </Card>

      {message ? <Alert variant="info">{message}</Alert> : null}
    </main>
  );
}
