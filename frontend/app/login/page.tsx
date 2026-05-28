"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/hooks/useToast";
import { Role } from "@/types/models";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const role = String(formData.get("role")) as Role;

    try {
      setLoading(true);
      setMessage("");
      const response = await login(email, password);
      setAuth(response.access_token, role);
      toast.success("Login realizado com sucesso.");
      if (role === "patient") {
        router.push("/paciente");
      } else {
        router.push("/odontologo");
      }
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Erro ao autenticar";
      setMessage(nextMessage);
      toast.error(nextMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap" style={{ maxWidth: 896 }}>
      <h1>Login</h1>
      <Card>
        <form onSubmit={onSubmit} className="form-grid">
          <Input id="email" name="email" type="email" label="Email" placeholder="seu@email.com" required />
          <Input id="password" name="password" type="password" label="Senha" placeholder="Digite sua senha" required />
          <Select id="role" name="role" label="Perfil" defaultValue="patient">
            <option value="patient">Paciente</option>
            <option value="dentist">Odontologo</option>
          </Select>
          <Button type="submit" loading={loading}>
            Entrar
          </Button>
          {message ? <Alert variant="error">{message}</Alert> : null}
        </form>
      </Card>

      <div className="row">
        <span className="muted">Nao possui conta?</span>
        <Link href="/register">Criar conta</Link>
      </div>
    </main>
  );
}
