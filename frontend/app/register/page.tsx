"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/hooks/useToast";
import { Role } from "@/types/models";
import { submitRegister } from "./register-actions";

export default function RegisterPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
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
    <main className="page-wrap" style={{ maxWidth: 896 }}>
      <h1>Cadastro</h1>
      <Card>
        <form onSubmit={onSubmit} className="form-grid">
          <Input id="name" name="name" label="Nome completo" placeholder="Digite seu nome" required />
          <Input id="email" name="email" type="email" label="Email" placeholder="seu@email.com" required />
          <Input id="password" name="password" type="password" label="Senha" placeholder="Crie uma senha segura" required />
          <Select id="role" name="role" label="Perfil" defaultValue="patient">
            <option value="patient">Paciente</option>
            <option value="dentist">Odontologo</option>
          </Select>
          <Button type="submit" loading={loading}>
            Cadastrar
          </Button>
          {message ? <Alert variant="success">{message}</Alert> : null}
        </form>
      </Card>

      <div className="row">
        <span className="muted">Ja possui conta?</span>
        <Link href="/login">Ir para login</Link>
      </div>
    </main>
  );
}
