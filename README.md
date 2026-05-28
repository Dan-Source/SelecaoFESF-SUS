# Sistema de Agendamento Odontologico

Aplicacao full-stack com perfis de paciente e odontologo.

## Stack

- Backend: FastAPI, SQLAlchemy, SQLite, JWT via OAuth2 Password Flow
- Frontend: Next.js (App Router), TypeScript, Zustand
- Testes: Pytest (backend) e Jest (frontend)
- Conteinerizacao: Docker + docker-compose

## Regras de negocio implementadas

1. Mesmo horario nao pode ter duas consultas.
2. Paciente so agenda horario disponivel.
3. Cancelar consulta libera horario.
4. Odontologo nao deleta horario com consulta.
5. Cada usuario acessa apenas seus recursos privados.

## Rodar com Docker (desenvolvimento com hot reload)

```bash
docker compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Docs API: http://localhost:8000/docs

Com esse compose em modo dev:

- Alteracoes em `backend/app` recarregam a API automaticamente.
- Alteracoes em `frontend` atualizam em tempo real no Next.js.

## Rodar localmente (sem Docker)

### Backend

Requisito: Python 3.12.

```bash
cd backend
uv python install 3.12
uv sync --group dev
uv run uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testes

### Backend

```bash
cd backend
uv run pytest
```

### Frontend

```bash
cd frontend
npm test
```

## Fluxo esperado

1. Cadastrar usuario com role `dentist` ou `patient`.
2. Fazer login para obter JWT.
3. Odontologo cria horarios.
4. Paciente lista odontologos, consulta horarios livres e agenda.
5. Paciente cancela e horario volta a ficar disponivel.
