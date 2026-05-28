"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/hooks/useToast";
import { Role } from "@/types/models";
import { submitRegister } from "./register-actions";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("patient");
  const toast = useToast();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    await submitRegister(
      {
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        role: String(formData.get("role")) as Role,
      },
      {
        registerUser,
        setMessage,
        setLoading,
        showSuccess: toast.success,
        showError: toast.error,
        resetForm: () => form.reset(),
      }
    );
  }

  return (
    <main className="page-wrap register-page" style={{ maxWidth: 896 }}>
      <div className="register-topbar">
        <Link href="/" className="register-back">
          Voltar
        </Link>
        <span aria-hidden="true" className="register-spacer" />
      </div>

      <section className="register-hero">
        <Card>
          <div className="register-hero-content">
            <p className="register-eyebrow">📝 Criar conta</p>
            <form onSubmit={onSubmit} className="form-grid register-form">
              <Input id="name" name="name" label="Nome completo" placeholder="João Silva" required />
              <Input id="email" name="email" type="email" label="Email" placeholder="joao@email.com" required />
              <Input id="password" name="password" type="password" label="Senha" placeholder="••••••••••" required />

              <div className="field">
                <span className="field-label">Sou:</span>
                <div className="role-toggle-grid" role="group" aria-label="Escolha seu perfil">
                  <Button
                    type="button"
                    variant={role === "patient" ? "primary" : "outline"}
                    fullWidth
                    className="role-toggle"
                    onClick={() => setRole("patient")}
                  >
                    😊 Paciente
                  </Button>
                  <Button
                    type="button"
                    variant={role === "dentist" ? "primary" : "outline"}
                    fullWidth
                    className="role-toggle"
                    onClick={() => setRole("dentist")}
                  >
                    🦷 Dentista
                  </Button>
                </div>
                <input type="hidden" name="role" value={role} />
              </div>

              <Button type="submit" loading={loading} fullWidth>
                Cadastrar
              </Button>
              {message ? <Alert variant="success">{message}</Alert> : null}
            </form>
          </div>
        </Card>
      </section>

      <div className="row register-footer">
        <span className="muted">Ja possui conta?</span>
        <Link href="/login">Entrar</Link>
      </div>
    </main>
  );
}
