"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await registerUser({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
        role: String(formData.get("role")) as "patient" | "dentist",
      });
      setMessage("Cadastro realizado com sucesso. Faca login.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao cadastrar");
    }
  }

  return (
    <main>
      <h1>Cadastro</h1>
      <form onSubmit={onSubmit} className="card">
        <div className="row">
          <input name="name" placeholder="Nome" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Senha" required />
          <select name="role" defaultValue="patient">
            <option value="patient">Paciente</option>
            <option value="dentist">Odontologo</option>
          </select>
          <button type="submit">Cadastrar</button>
        </div>
        <p>{message}</p>
      </form>
      <Link href="/login">Ir para login</Link>
    </main>
  );
}
