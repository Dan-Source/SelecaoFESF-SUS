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
  const { token, role } = useAuthStore();
  const { appointments, setAppointments } = usePatientStore();
  const [authHydrated, setAuthHydrated] = useState(useAuthStore.persist.hasHydrated());
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [search, setSearch] = useState("");
  const [selectedDentist, setSelectedDentist] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loadingDentists, setLoadingDentists] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<number | null>(null);
  const toast = useToast();

  const selectedDentistData = dentists.find((dentist) => dentist.id === selectedDentist) ?? null;
  const filteredDentists = dentists.filter((dentist) => dentist.name.toLowerCase().includes(search.toLowerCase()));

  async function refreshAppointments(showLoading = true) {
    if (!token) return;
    try {
      if (showLoading) {
        setLoadingAppointments(true);
      }
      const data = await listMyAppointments(token);
      setAppointments(data);
    } finally {
      if (showLoading) {
        setLoadingAppointments(false);
      }
    }
  }

  async function loadDentists() {
    if (!token) return;
    try {
      setLoadingDentists(true);
      const data = await listDentists(token);
      setDentists(data);
    } finally {
      setLoadingDentists(false);
    }
  }

  async function loadSlots(dentistId: number) {
    if (!token) return;
    try {
      setLoadingSlots(true);
      const data = await listDentistFreeSlots(dentistId, token);
      setSlots(data);
    } finally {
      setLoadingSlots(false);
    }
  }

  useEffect(() => {
    const unsubscribeHydrate = useAuthStore.persist.onHydrate(() => {
      setAuthHydrated(false);
    });

    const unsubscribeFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setAuthHydrated(true);
    });

    setAuthHydrated(useAuthStore.persist.hasHydrated());

    return () => {
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!authHydrated) {
      return;
    }

    if (!token || role !== "patient") {
      setMessage("Faca login como paciente.");
      return;
    }

    loadDentists().catch((error) => setMessage(error.message));
    refreshAppointments().catch((error) => setMessage(error.message));
  }, [authHydrated, token, role]);

  if (!authHydrated) {
    return (
      <main className="page-wrap page-loading">
        <Spinner label="Carregando sua area" />
      </main>
    );
  }

  if (((!token || role !== "patient") && message) || (!token || role !== "patient")) {
    return (
      <main className="page-wrap">
        <h1>Area do Paciente</h1>
        <Alert variant="warning">{message}</Alert>
      </main>
    );
  }

  return (
    <main className="page-wrap patient-page">
      <section className="patient-topbar">
        <div>
          <h1>Olá, paciente! 👋</h1>
          <p className="muted">Escolha um profissional, veja horários livres e gerencie suas consultas.</p>
        </div>
      </section>

      <Card title="📋 Lista de dentistas">
        <div className="field patient-search-wrap">
          <label htmlFor="dentist-search" className="field-label">
            🔍 Buscar
          </label>
          <input
            id="dentist-search"
            placeholder="Digite o nome do dentista"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loadingDentists ? <Spinner label="Carregando dentistas" /> : null}

        {!loadingDentists && filteredDentists.length === 0 ? (
          <p className="muted">Nenhum dentista encontrado para o filtro informado.</p>
        ) : null}

        <div className="dentist-grid">
          {filteredDentists.map((dentist) => {
            const isSelected = selectedDentist === dentist.id;

            return (
              <article key={dentist.id} className={`dentist-card ${isSelected ? "dentist-card-selected" : ""}`}>
                <strong>🦷 {dentist.name}</strong>
                <p className="muted">Profissional #{dentist.id}</p>
                <Button
                  variant={isSelected ? "secondary" : "primary"}
                  onClick={() => {
                    setSelectedDentist(dentist.id);
                    loadSlots(dentist.id).catch((error) => setMessage(error.message));
                  }}
                >
                  Ver horários
                </Button>
              </article>
            );
          })}
        </div>
      </Card>

      <Card title="🕐 Horários livres">
        {!selectedDentistData ? <p className="muted">Selecione um dentista para ver os horários.</p> : null}

        {selectedDentistData ? (
          <p className="patient-selected-title">
            {selectedDentistData.name} - horários disponíveis:
          </p>
        ) : null}

        {loadingSlots ? <Spinner label="Carregando horários" /> : null}

        {selectedDentistData && !loadingSlots && slots.length === 0 ? (
          <p className="muted">Nenhum horário disponível para este profissional.</p>
        ) : null}

        <div className="slot-grid">
          {slots.map((slot) => (
            <article key={slot.id} className="slot-card">
              <p className="slot-time">{new Date(slot.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
              <p className="muted slot-date">{new Date(slot.start_time).toLocaleDateString()}</p>
              <Badge variant={slot.available ? "available" : "booked"}>{slot.available ? "Disponível" : "Ocupado"}</Badge>
              <Button
                loading={bookingSlotId === slot.id}
                onClick={async () => {
                  if (!token) {
                    return;
                  }

                  try {
                    setBookingSlotId(slot.id);
                    await createAppointment(slot.id, token);
                    setMessage("Consulta agendada.");
                    toast.success("Consulta agendada.");
                    if (selectedDentist) {
                      await loadSlots(selectedDentist);
                    }
                    await refreshAppointments(false);
                  } catch (error) {
                    const nextMessage = error instanceof Error ? error.message : "Erro ao agendar";
                    setMessage(nextMessage);
                    toast.error(nextMessage);
                  } finally {
                    setBookingSlotId(null);
                  }
                }}
              >
                Agendar
              </Button>
            </article>
          ))}
        </div>
      </Card>

      <Card title="📅 Minhas consultas">
        {loadingAppointments ? <Spinner label="Carregando consultas" /> : null}

        {!loadingAppointments && appointments.length === 0 ? (
          <p className="muted">Você não possui consultas agendadas.</p>
        ) : null}

        <div className="appointment-list">
          {appointments.map((appointment) => {
            const dentistName = dentists.find((dentist) => dentist.id === appointment.dentist_id)?.name ?? `Dentista #${appointment.dentist_id}`;

            return (
              <article key={appointment.id} className="appointment-item">
                <div className="appointment-main">
                  <span>📅 {new Date(appointment.created_at).toLocaleDateString()} - {new Date(appointment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{dentistName}</span>
                  <Badge variant="info">Agendada</Badge>
                </div>
                <Button
                  variant="danger"
                  loading={cancelingAppointmentId === appointment.id}
                  onClick={async () => {
                    if (!token) {
                      return;
                    }

                    if (!window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
                      return;
                    }

                    try {
                      setCancelingAppointmentId(appointment.id);
                      await cancelAppointment(appointment.id, token);
                      setMessage("Consulta cancelada.");
                      toast.warning("Consulta cancelada.");
                      await refreshAppointments(false);
                      if (selectedDentist) {
                        await loadSlots(selectedDentist);
                      }
                    } catch (error) {
                      const nextMessage = error instanceof Error ? error.message : "Erro ao cancelar";
                      setMessage(nextMessage);
                      toast.error(nextMessage);
                    } finally {
                      setCancelingAppointmentId(null);
                    }
                  }}
                >
                  Cancelar
                </Button>
              </article>
            );
          })}
        </div>
      </Card>

      {message ? <Alert variant="info">{message}</Alert> : null}
    </main>
  );
}
