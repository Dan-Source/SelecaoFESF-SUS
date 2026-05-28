import "./globals.css";
import type { ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { ToastContainer } from "@/components/ToastContainer";

export const metadata = {
  title: "DentalCare",
  description: "Sistema de agendamento odontologico para pacientes e odontologos",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <AppHeader />
          {children}
          <ToastContainer />
        </div>
      </body>
    </html>
  );
}
