# Seleção FESF-SUS

Aplicação full-stack para agendamento odontológico com perfis de paciente e odontólogo.

## Objetivo deste README

Este guia foi refinado para banca avaliadora:

1. Comprovar cada critério com links diretos para arquivos/pastas do repositório.
2. Permitir validação rápida do sistema com e sem Docker.
3. Trazer passo a passo objetivo, sem configuração desnecessária.

> O README original foi preservado em [docs/README.md](docs/README.md) para referência histórica.

## Comprovação dos critérios (com links)

### Seleção FESF-SUS - 1 F.C

**Requisito:** API funcional em Python (FastAPI + SQLAlchemy) e Frontend React/Next.js com Zustand.

**Backend (FastAPI + SQLAlchemy)**

- App FastAPI e healthcheck: [backend/app/main.py](backend/app/main.py)
- Rotas da API:
	- [backend/app/api/routes/auth.py](backend/app/api/routes/auth.py)
	- [backend/app/api/routes/dentists.py](backend/app/api/routes/dentists.py)
	- [backend/app/api/routes/patients.py](backend/app/api/routes/patients.py)
- Sessão/banco SQLAlchemy:
	- [backend/app/db/session.py](backend/app/db/session.py)
	- [backend/app/db/base.py](backend/app/db/base.py)
- Modelos SQLAlchemy:
	- [backend/app/models/user.py](backend/app/models/user.py)
	- [backend/app/models/schedule_slot.py](backend/app/models/schedule_slot.py)
	- [backend/app/models/appointment.py](backend/app/models/appointment.py)
- Dependências FastAPI/SQLAlchemy: [backend/pyproject.toml](backend/pyproject.toml)

**Frontend (Next.js + Zustand)**

- App Router Next.js: [frontend/app](frontend/app)
- Store Zustand (autenticação): [frontend/store/auth.ts](frontend/store/auth.ts)
- Outras stores Zustand:
	- [frontend/store/dentist.ts](frontend/store/dentist.ts)
	- [frontend/store/patient.ts](frontend/store/patient.ts)
- Dependências Next/React/Zustand: [frontend/package.json](frontend/package.json)

### Seleção FESF-SUS - 2 F.C

**Requisito:** conteinerização funcional com Docker + docker-compose + OAuth2.

- Compose base: [docker-compose.yml](docker-compose.yml)
- Compose desenvolvimento: [docker-compose.dev.yml](docker-compose.dev.yml)
- Compose produção: [docker-compose.prod.yml](docker-compose.prod.yml)
- Dockerfile backend: [backend/Dockerfile](backend/Dockerfile)
- Dockerfile frontend: [frontend/Dockerfile](frontend/Dockerfile)

**OAuth2/JWT implementado em:**

- Segurança e `OAuth2PasswordBearer`: [backend/app/core/security.py](backend/app/core/security.py)
- Login com `OAuth2PasswordRequestForm`: [backend/app/api/routes/auth.py](backend/app/api/routes/auth.py)

### Seleção FESF-SUS - 3 F.C

**Requisito:** implantação funcional de Redis (cache).

- Serviço Redis no Docker: [docker-compose.yml](docker-compose.yml)
- Configuração Redis da aplicação: [backend/app/core/config.py](backend/app/core/config.py)
- Camada de cache Redis: [backend/app/core/cache.py](backend/app/core/cache.py)
- Invalidação de cache: [backend/app/core/cache_utils.py](backend/app/core/cache_utils.py)
- Uso de cache nas rotas:
	- [backend/app/api/routes/dentists.py](backend/app/api/routes/dentists.py)
	- [backend/app/api/routes/patients.py](backend/app/api/routes/patients.py)

### Seleção FESF-SUS - 4 F.C

**Requisito:** testes unitários e de integração (Pytest e/ou Jest).

- Testes backend (pytest): [backend/tests](backend/tests)
- Unitários backend: [backend/tests/unit/test_services.py](backend/tests/unit/test_services.py)
- Integração backend (fluxo completo): [backend/tests/integration/test_api_flow.py](backend/tests/integration/test_api_flow.py)
- Configuração pytest: [backend/pyproject.toml](backend/pyproject.toml)

- Testes frontend (jest): [frontend/tests](frontend/tests)
- Testes login: [frontend/tests/login-actions.test.ts](frontend/tests/login-actions.test.ts)
- Testes cadastro: [frontend/tests/register-actions.test.ts](frontend/tests/register-actions.test.ts)
- Configuração jest: [frontend/jest.config.ts](frontend/jest.config.ts)

## Regras de negócio implementadas

1. Mesmo horário não pode ter duas consultas.
2. Paciente só agenda horário disponível.
3. Cancelar consulta libera horário.
4. Odontólogo não deleta horário com consulta.
5. Cada usuário acessa apenas seus recursos privados.

## Validação rápida (5 minutos)

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Depois valide:

1. Frontend em http://localhost:3000
2. Backend em http://localhost:8000
3. Swagger em http://localhost:8000/docs
4. Healthcheck em http://localhost:8000/health

## Rodar com Docker (desenvolvimento)

### Subir todos os serviços

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Serviços esperados:
- Backend
- Frontend
- PostgreSQL
- Redis

Comportamento em dev:

- Alterações em `backend/app` recarregam a API automaticamente.
- Alterações em `frontend` atualizam no Next.js em tempo real.

## Rodar sem Docker (local mais eficiente)

Fluxo recomendado: subir só infraestrutura com Docker (PostgreSQL + Redis) e rodar backend/frontend localmente.

### 1) Subir apenas PostgreSQL e Redis

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d postgres redis
```

### 2) Backend local

Requisitos: Python 3.12 e `uv`.

```bash
cd backend
uv python install 3.12
uv sync --group dev
cp .env.example .env
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

### 3) Frontend local

Requisito: Node.js 20+.

```bash
cd frontend
npm install
npm run dev
```

### 4) Verificação local

- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Testes

### Backend (pytest)

```bash
cd backend
TEST_DATABASE_URL=postgresql+psycopg://odonto:odonto@localhost:5432/odonto_test uv run pytest
```

Se o banco de teste `odonto_test` não existir:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec postgres psql -U odonto -d postgres -c "CREATE DATABASE odonto_test;"
```

### Frontend (jest)

```bash
cd frontend
npm test
```

## Banco de dados (migrações)

Aplicar migrações:

```bash
cd backend
uv run alembic upgrade head
```

Criar nova migração:

```bash
cd backend
uv run alembic revision -m "descricao"
```

Aplicar nova migração:

```bash
cd backend
uv run alembic upgrade head
```

## Fluxo funcional esperado

1. Cadastrar usuário com role `dentist` ou `patient`.
2. Fazer login para obter JWT.
3. Odontólogo cria horários.
4. Paciente lista odontólogos, consulta horários livres e agenda.
5. Paciente cancela e horário volta a ficar disponível.
