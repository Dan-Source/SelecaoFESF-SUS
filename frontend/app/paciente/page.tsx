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
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/hooks/useToast";
import { Dentist, Slot } from "@/types/models";

export default function PacientePage() {
  const { token, role, logout } = useAuthStore();
  const { appointments, setAppointments } = usePatientStore();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDentist, setSelectedDentist] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

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
      <main className="page-wrap">
        <h1>Area do Paciente</h1>
        <Alert variant="warning">{message}</Alert>
      </main>
    );
  }

  return (
    <main className="page-wrap">
      <h1>Area do Paciente</h1>
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
        <Card title="Proximas consultas">
          <p className="muted">{appointments.length} consulta(s) cadastrada(s).</p>
        </Card>
        <Card title="Dentistas disponiveis">
          <p className="muted">{dentists.length} profissional(is) listado(s).</p>
        </Card>
      </div>

      <Card title="Odontologos">
        {loading ? <Spinner label="Carregando dados" /> : null}
        <div className="list">
          {dentists.map((dentist) => (
            <div key={dentist.id} className="list-item">
              <span>{dentist.name}</span>
              <Button
              onClick={() => {
                setSelectedDentist(dentist.id);
                loadSlots(dentist.id).catch((error) => setMessage(error.message));
              }}
            >
              Ver horarios livres
            </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card title={`Horarios livres ${selectedDentist ? `(odontologo ${selectedDentist})` : ""}`}>
        <div className="list">
          {slots.map((slot) => (
            <div key={slot.id} className="list-item">
              <span>
                {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleString()}
              </span>
              <div className="row">
                <Badge variant={slot.available ? "available" : "booked"}>{slot.available ? "Disponivel" : "Ocupado"}</Badge>
                <Button
              onClick={async () => {
                try {
                  setLoading(true);
                  await createAppointment(slot.id, token);
                  setMessage("Consulta agendada.");
                  toast.success("Consulta agendada.");
                  if (selectedDentist) {
                    await loadSlots(selectedDentist);
                  }
                  await refreshAppointments();
                } catch (error) {
                  const nextMessage = error instanceof Error ? error.message : "Erro ao agendar";
                  setMessage(nextMessage);
                  toast.error(nextMessage);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Marcar consulta
            </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Minhas consultas">
        <div className="list">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="list-item">
              <span>
                Consulta #{appointment.id} - Slot #{appointment.slot_id}
              </span>
              <Button
                variant="danger"
              onClick={async () => {
                if (!window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
                  return;
                }

                try {
                  setLoading(true);
                  await cancelAppointment(appointment.id, token);
                  setMessage("Consulta cancelada.");
                  toast.warning("Consulta cancelada.");
                  await refreshAppointments();
                  if (selectedDentist) {
                    await loadSlots(selectedDentist);
                  }
                } catch (error) {
                  const nextMessage = error instanceof Error ? error.message : "Erro ao cancelar";
                  setMessage(nextMessage);
                  toast.error(nextMessage);
                } finally {
                  setLoading(false);
                }
              }}
            >
              Cancelar
            </Button>
            </div>
          ))}
        </div>
      </Card>

      {message ? <Alert variant="info">{message}</Alert> : null}
    </main>
  );
}
