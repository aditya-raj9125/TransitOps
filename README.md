# FleetPilot — Smart Transport Operations Platform

> **Command your fleet. Trust your data.**

A production-grade, full-stack fleet operations platform built on **PostgreSQL + NestJS + React**. Digitizes vehicle management, driver dispatch, maintenance tracking, fuel & expense logging, and real-time operational analytics — all enforced through a strict RBAC layer and business-rule validation pipeline.

---

## Architecture

```
TransitOps/
├── backend/          # NestJS + TypeScript + Prisma ORM
├── frontend/         # React 18 + TypeScript + Vite + TailwindCSS
├── docker-compose.yml
├── .env.example
└── README.md
```

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, TanStack Query, Zustand, Recharts, FullCalendar |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL 15 |
| Auth | JWT (access + refresh rotation), Argon2 hashing, httpOnly cookies |
| Real-time | Socket.io + PostgreSQL LISTEN/NOTIFY |
| Jobs | node-cron (expiry sweeps) |
| Export | csv-writer, Puppeteer (PDF) |
| Containers | Docker + docker-compose |

---

## Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 18
- PostgreSQL 15 (or use Docker)
- Docker + docker-compose (optional, for containerized run)

### Option A — Docker (recommended, zero manual DB setup)

```bash
cp .env.example .env          # Edit DB credentials if needed
docker-compose up --build     # Starts postgres + backend + frontend
```

The seed script runs automatically on first start. Open http://localhost:5173

### Option B — Manual

```bash
# 1. Clone and install dependencies
git clone https://github.com/aditya-raj9125/TransitOps.git
cd TransitOps

# 2. Backend setup
cd backend
cp ../.env.example .env
npm install
npm run db:migrate     # Run Prisma migrations
npm run db:seed        # Seed demo data
npm run start:dev      # Starts on http://localhost:3001

# 3. Frontend setup (new terminal)
cd ../frontend
npm install
npm run dev            # Starts on http://localhost:5173
```

---

## Environment Variables

See [`.env.example`](./.env.example) for all required variables.

Key variables:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/fleetpilot` |
| `JWT_SECRET` | Access token signing secret | *(required)* |
| `JWT_REFRESH_SECRET` | Refresh token signing secret | *(required)* |
| `PORT` | Backend port | `3001` |
| `FRONTEND_URL` | CORS origin | `http://localhost:5173` |

---

## Database Migrations

```bash
cd backend
npm run db:migrate      # Apply all pending migrations
npm run db:migrate:dev  # Create a new migration (dev only)
npm run db:seed         # Seed realistic demo data
npm run db:reset        # Reset DB + re-seed (destructive!)
```

---

## Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@fleetpilot.dev | FleetPilot@2026 |
| Fleet Manager | fleet@fleetpilot.dev | FleetPilot@2026 |
| Dispatcher | dispatch@fleetpilot.dev | FleetPilot@2026 |
| Safety Officer | safety@fleetpilot.dev | FleetPilot@2026 |
| Financial Analyst | finance@fleetpilot.dev | FleetPilot@2026 |

---

## API Reference

Base URL: `http://localhost:3001/api/v1`

All responses follow the envelope:
```json
{ "data": {}, "meta": {}, "error": null }
```

Key endpoints:
- `POST /auth/login` — authenticate, returns access token + sets refresh cookie
- `GET /vehicles?page=1&pageSize=20&q=searchTerm&status=Available`
- `POST /trips/:id/dispatch` — dispatch a trip (runs full validation pipeline)
- `GET /reports/analytics?from=2026-01-01&to=2026-07-01&region=north`

Full API docs available at `http://localhost:3001/api/docs` (Swagger) after starting the backend.

---

## RBAC Roles

| Role | Key Capabilities |
|---|---|
| **Admin** | Full access, user/role management, audit log |
| **Fleet Manager** | CRUD vehicles & maintenance, view all reports |
| **Dispatcher** | Create/dispatch/complete/cancel trips |
| **Safety Officer** | CRUD drivers, license tracking, suspend drivers |
| **Financial Analyst** | Read-only fleet data, full fuel/expense/reports access, CSV/PDF export |

---

## Business Rules Enforced

- Cargo weight ≤ vehicle max load capacity (service layer + DB trigger)
- Vehicle must be `Available` to be dispatched (never `On Trip`, `In Shop`, `Retired`)
- Driver must be `Available`, license not expired, not `Suspended`
- No overlapping active trips per vehicle or driver (DB-level partial unique index + advisory lock)
- All state transitions (dispatch/complete/cancel/maintenance) execute inside a single DB transaction

---

## License

MIT © FleetPilot
