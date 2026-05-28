import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="page-wrap">
      <h1>DentalCare</h1>
      <p className="muted">Agendamento odontologico profissional, acolhedor e simples.</p>
      <Card title="Comece agora">
        <div className="row">
          <Link href="/register" className="btn-primary">
            Criar conta
          </Link>
          <Link href="/login" className="btn-secondary">
            Entrar
          </Link>
        </div>
      </Card>
    </main>
  );
}
