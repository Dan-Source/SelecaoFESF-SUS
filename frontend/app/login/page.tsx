"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const role = String(formData.get("role")) as "patient" | "dentist";

    try {
      const response = await login(email, password);
      setAuth(response.access_token, role);
      if (role === "patient") {
        router.push("/paciente");
      } else {
        router.push("/odontologo");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao autenticar");
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={onSubmit} className="card">
        <div className="row">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Senha" required />
          <select name="role" defaultValue="patient">
            <option value="patient">Paciente</option>
            <option value="dentist">Odontologo</option>
          </select>
          <button type="submit">Entrar</button>
        </div>
        <p>{message}</p>
      </form>
      <Link href="/register">Criar conta</Link>
    </main>
  );
}
