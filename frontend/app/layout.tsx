import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Agendamento Odontologico",
  description: "Sistema de agendamento para paciente e odontologo",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
