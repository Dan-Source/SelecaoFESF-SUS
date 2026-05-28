import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Sistema de Agendamento Odontologico</h1>
      <div className="card">
        <p>Escolha uma acao:</p>
        <div className="row">
          <Link href="/register">Cadastro</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </main>
  );
}
