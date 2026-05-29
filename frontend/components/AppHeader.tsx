"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { token, role, logout } = useAuthStore();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand" aria-label="Ir para a tela inicial">
          <span>Dental Care</span>
        </Link>

        <nav className="top-nav" aria-label="Navegacao principal">
          {!token && <Link href="/login">Entrar</Link>}
          {!token && <Link href="/register">Criar conta</Link>}
          {token && role === "patient" && <Link href="/paciente">Área do paciente</Link>}
          {token && role === "dentist" && <Link href="/odontologo">Área do odontólogo</Link>}
          {token && pathname !== "/" && (
            <span className="badge badge-info">{pathname.replace("/", "") || "inicio"}</span>
          )}
        </nav>

        {token ? (
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Sair
          </Button>
        ) : null}
      </div>
    </header>
  );
}