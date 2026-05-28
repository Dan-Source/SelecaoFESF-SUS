"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useToast } from "@/hooks/useToast";
import { submitLogin } from "./login-actions";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await submitLogin(
      {
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      },
      {
        loginUser: login,
        setAuth,
        navigate: (path) => router.push(path),
        setMessage,
        setLoading,
        showSuccess: toast.success,
        showError: toast.error,
      }
    );
  }

  return (
    <main className="page-wrap" style={{ maxWidth: 896 }}>
      <h1>Login</h1>
      <Card>
        <form onSubmit={onSubmit} className="form-grid">
          <Input id="email" name="email" type="email" label="Email" placeholder="seu@email.com" required />
          <Input id="password" name="password" type="password" label="Senha" placeholder="Digite sua senha" required />
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
