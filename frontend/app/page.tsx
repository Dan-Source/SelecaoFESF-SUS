"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  const { token, role } = useAuthStore();

  const isPatient = token && role === "patient";
  const isDentist = token && role === "dentist";

  return (
    <main className="page-wrap home-page">
      <section className="home-hero">
        <Card>
          <div className="home-hero-content">
            <p className="home-eyebrow">💙 Agende sua consulta odontológica de forma simples e rápida</p>
            <h1>DentalCare</h1>
            <p className="home-lead">
              Uma experiência clara para pacientes e odontólogos, com agendamento direto, horários livres e confirmação imediata.
            </p>

            <div className="home-actions">
              {!token && (
                <>
                  <Link href="/register" className="btn-primary home-cta">
                    Criar conta gratuita
                  </Link>
                  <Link href="/login" className="btn-secondary home-cta">
                    Entrar
                  </Link>
                </>
              )}

              {isPatient ? (
                <Link href="/paciente" className="btn-primary home-cta">
                  Ir para a área do paciente
                </Link>
              ) : null}

              {isDentist ? (
                <Link href="/odontologo" className="btn-primary home-cta">
                  Ir para a área do odontólogo
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      </section>

      <section aria-label="Benefícios do serviço" className="home-features">
        <Card>
          <div className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              📅
            </div>
            <h2>Fácil</h2>
            <p className="muted">Agende em minutos com um fluxo direto e sem etapas desnecessárias.</p>
          </div>
        </Card>

        <Card>
          <div className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              🦷
            </div>
            <h2>Seguro</h2>
            <p className="muted">Profissionais e pacientes organizados em uma plataforma simples e confiável.</p>
          </div>
        </Card>

        <Card>
          <div className="home-feature-card">
            <div className="home-feature-icon" aria-hidden="true">
              ⏰
            </div>
            <h2>Rápido</h2>
            <p className="muted">Visualize horários disponíveis e confirme a consulta sem demora.</p>
          </div>
        </Card>
      </section>
    </main>
  );
}
