# Sistema de Agendamento Odontologico

Aplicacao full-stack com perfis de paciente e odontologo.

## Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL, Redis cache, JWT via OAuth2 Password Flow
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
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Docs API: http://localhost:8000/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6380

Com esse compose em modo dev:

- Alteracoes em `backend/app` recarregam a API automaticamente.
- Alteracoes em `frontend` atualizam em tempo real no Next.js.

## Rodar com Docker (producao)

Defina as variaveis obrigatorias e rode:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

Variaveis obrigatorias em producao:

- `DATABASE_URL`
- `REDIS_URL`
- `REDIS_PASSWORD`
- `JWT_SECRET_KEY`
- `CORS_ORIGINS`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `NEXT_PUBLIC_API_URL`

## Rodar localmente (sem Docker)

### Backend

Requisito: Python 3.12.

```bash
cd backend
uv python install 3.12
uv sync --group dev
cp .env.example .env
uv run alembic upgrade head
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
TEST_DATABASE_URL=postgresql+psycopg://odonto:odonto@localhost:5432/odonto_test uv run pytest
```

Caso o banco `odonto_test` nao exista, crie antes de rodar os testes:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U odonto -d postgres -c "CREATE DATABASE odonto_test;"
```

### Frontend

```bash
cd frontend
npm test
```

### Banco (migracoes)

```bash
cd backend
uv run alembic upgrade head
```

Para gerar uma nova migracao:

```bash
cd backend
uv run alembic revision -m "descricao"
```

E depois aplicar:

```bash
cd backend
uv run alembic upgrade head
```

## Fluxo esperado

1. Cadastrar usuario com role `dentist` ou `patient`.
2. Fazer login para obter JWT.
3. Odontologo cria horarios.
4. Paciente lista odontologos, consulta horarios livres e agenda.
5. Paciente cancela e horario volta a ficar disponivel.
