# EchoGPT Backend

> Production-ready REST API powering the **EchoGPT Multi-AI Chat Sidebar** Chrome extension.
> Built with NestJS, PostgreSQL, TypeORM, and Swagger.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Docker Setup](#docker-setup)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Security](#security)
- [Screenshots](#screenshots)

---

## Features

### 🔐 Authentication & Authorization

- User registration with email + password
- JWT-based authentication (access + refresh tokens)
- Refresh token rotation with SHA-256 hashed storage
- Session management (list, revoke, revoke-all)
- Password hashing with bcrypt (cost 12)
- Role-based access control (Admin, User)
- Rate-limited auth endpoints (Throttler)

### 👤 User Management

- Profile retrieval & updates
- Password change (invalidates all sessions)
- Account soft-delete
- Active session listing

### 💳 Subscription Management

- Free & Premium tier plans
- Usage quota tracking (requests, searches)
- Remaining quota endpoint
- Upgrade / downgrade with automatic period reset
- Per-plan provider limits

### 🤖 AI Provider Management

- Multi-provider support: **OpenAI**, **Claude**, **Gemini**
- Add / edit / delete custom providers
- Enable / disable per-provider
- Default provider selection (per-user + system default)
- API keys encrypted at rest with **AES-256-GCM**
- Health check endpoints

### 💬 Chat API

- Send prompts and receive AI completions
- Session-based conversation history
- Automatic session titling
- Token usage & latency tracking
- Multi-provider fallback (explicit → user default → system default)

### 🔍 Web Search API

- Search query execution
- Paginated search history
- Recent searches (last 10)
- Suggestions from history
- Search result caching (bonus)

### 🛠 Admin Panel

- Dashboard statistics (users, subs, requests, providers)
- User management (roles, status, soft-delete)
- Subscription management
- Provider management
- API usage analytics (time-series)
- Request logs with filters
- System health

### 📚 Documentation

- Full OpenAPI 3 spec via Swagger
- Every endpoint documented with request/response examples
- Postman collection included

---

## Tech Stack

| Layer           | Technology                             |
| --------------- | -------------------------------------- |
| **Runtime**     | Node.js 20 LTS                         |
| **Language**    | TypeScript 5.x (strict)                |
| **Framework**   | NestJS 11                              |
| **Database**    | PostgreSQL 16                          |
| **ORM**         | TypeORM 0.3                            |
| **Auth**        | Passport + JWT (@nestjs/jwt)           |
| **Validation**  | class-validator + class-transformer    |
| **API Docs**    | @nestjs/swagger (OpenAPI 3)            |
| **Security**    | Helmet, bcrypt, Throttler, AES-256-GCM |
| **HTTP Client** | @nestjs/axios                          |
| **Cache**       | cache-manager (Redis-ready)            |
| **Container**   | Docker + Docker Compose                |
| **Testing**     | Jest + Supertest                       |

---

## Architecture

### Layered Design

```
┌────────────────────────────────────────────────────┐
│  HTTP Layer (Controllers)                          │
│  · DTO validation                                  │
│  · Swagger annotations                             │
│  · Route handling                                  │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  Guard Layer                                       │
│  · ThrottlerGuard  → rate limiting                 │
│  · JwtAuthGuard    → authentication                │
│  · RolesGuard      → authorization                 │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  Business Layer (Services)                         │
│  · Domain logic                                    │
│  · Transactions                                    │
│  · Provider adapters                               │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  Data Layer (Repositories via TypeORM)             │
│  · Entity mapping                                  │
│  · Query building                                  │
└──────────────────────┬─────────────────────────────┘
                       │
┌──────────────────────▼─────────────────────────────┐
│  PostgreSQL 17                                     │
└────────────────────────────────────────────────────┘
```

### Cross-cutting Concerns

- **TransformInterceptor** — wraps every response in a standard envelope
- **AllExceptionsFilter** — uniform error shape, no stack traces in prod
- **ValidationPipe** — global DTO validation with whitelist + forbidNonWhitelisted
- **ConfigModule** — typed, validated environment config

### Module Map

| Module                | Responsibility                                 |
| --------------------- | ---------------------------------------------- |
| `AuthModule`          | Register, login, refresh, logout, JWT strategy |
| `UsersModule`         | Profile, password, sessions, roles bootstrap   |
| `SessionsModule`      | Refresh token storage, revocation              |
| `SubscriptionsModule` | Plans, quotas, remaining, upgrade/downgrade    |
| `ProvidersModule`     | AI provider CRUD, encryption, adapters, health |
| `ChatModule`          | Chat completions, sessions, message history    |
| `SearchModule`        | Web search, history, suggestions               |
| `UsageModule`         | API usage logging, aggregation                 |
| `AdminModule`         | Dashboard, user/subs/provider management, logs |
| `HealthModule`        | Liveness, DB health                            |

---

## Getting Started

### Prerequisites

| Tool             | Version                           |
| ---------------- | --------------------------------- |
| Node.js          | ≥ 20.19 (22.12+ recommended)      |
| npm              | ≥ 10                              |
| PostgreSQL       | ≥ 17 (Docker image provided)      |
| Docker + Compose | Latest (optional but recommended) |
| Git              | Latest                            |

Verify:

```bash
node -v    # v20.19.x or higher
npm -v     # 10.x or higher
docker -v  # (optional)
```

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/echogpt-backend.git
cd echogpt-backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Then open .env and set at minimum:
#   DB_*           — database connection
#   JWT_ACCESS_SECRET, JWT_REFRESH_SECRET   — ≥ 32 chars
#   ENCRYPTION_KEY — 64-char hex (32 bytes)
```

Generate a secure `ENCRYPTION_KEY`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### Database Setup

**Option A — Using Docker (recommended)**

```bash
docker compose up -d postgres redis
```

**Option B — Using a local Postgres**

Create the database and user manually:

```sql
CREATE USER echogpt WITH PASSWORD 'echogpt';
CREATE DATABASE echogpt OWNER echogpt;
```

Then run migrations and seed:

```bash
# Apply all migrations
npm run migration:run

# Seed roles, plans, demo users, system providers
npm run db:seed

# Later, to refresh features & limits on existing rows:
npm run db:seed -- --update
```

Verify:

```bash
docker compose exec postgres psql -U echogpt -d echogpt -c "SELECT 'roles' AS t, COUNT(*) FROM roles UNION ALL SELECT 'plans', COUNT(*) FROM plans UNION ALL SELECT 'users', COUNT(*) FROM users;"
```

Expected:

```
       t       | count
---------------+-------
 roles         |     2
 plans         |     2
 users         |     2
```

### Running the Application

**Development (hot reload)**

```bash
npm run start:dev
```

**Debug**

```bash
npm run start:debug
```

**Production build**

```bash
npm run build
npm run start:prod
```

After boot:

- API root: http://localhost:3000/api/v1
- Health: http://localhost:3000/api/v1/health
- Swagger: http://localhost:3000/api/docs

**Default credentials (from seeds):**

| Role  | Email                 | Password    |
| ----- | --------------------- | ----------- |
| Admin | `admin@echogpt.local` | `Admin@123` |
| User  | `user@echogpt.local`  | `User@123`  |

> Change these before any real deployment.

---

## Docker Setup

### Full stack in Docker

```bash
# Build + boot everything (Postgres + Redis + API)
docker compose up -d --build

# Watch API logs
docker compose logs -f api

# Run migrations + seed inside the container
docker compose exec api npm run migration:run
docker compose exec api npm run db:seed

# Open Swagger
open http://localhost:3000/api/docs
```

### Dev workflow (DB in Docker, API on host)

```bash
# 1. Start only the data services
docker compose up -d postgres redis

# 2. Run the API on the host for hot reload
npm run start:dev
```

### Production overlay

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### Common Docker commands

| Task                | Command                                                   |
| ------------------- | --------------------------------------------------------- |
| List services       | `docker compose ps`                                       |
| Tail all logs       | `docker compose logs -f`                                  |
| Shell into API      | `docker compose exec api sh`                              |
| Shell into Postgres | `docker compose exec postgres psql -U echogpt -d echogpt` |
| Restart API         | `docker compose restart api`                              |
| Rebuild API         | `docker compose up -d --build api`                        |
| Stop (keep data)    | `docker compose down`                                     |
| Stop + wipe volumes | `docker compose down -v`                                  |
| Full cleanup        | `docker system prune -af --volumes`                       |

---

## API Documentation

### Swagger UI

Interactive docs, live request execution, and full schemas:

```
http://localhost:3000/api/docs
```

Features enabled:

- **Authorize** button for Bearer tokens (persists across reloads)
- Request duration display
- Search/filter by tag or endpoint
- Full DTO schemas with examples and validation rules
- Error response documentation per endpoint

### OpenAPI JSON

Download the raw spec:

```bash
curl http://localhost:3000/api/docs-json > openapi.json
```

Set the collection variable `baseUrl` to `http://localhost:3000/api/v1` and the `token` variable to a valid access token.

---

## API Endpoints

Base path: `/api/v1`. All protected routes require `Authorization: Bearer <accessToken>`.

### Auth — `/auth`

| Method | Endpoint           | Auth   | Description                      |
| ------ | ------------------ | ------ | -------------------------------- |
| POST   | `/auth/register`   | Public | Register a new user              |
| POST   | `/auth/login`      | Public | Login (returns access + refresh) |
| POST   | `/auth/refresh`    | Public | Rotate tokens                    |
| POST   | `/auth/logout`     | Bearer | Revoke all sessions              |
| POST   | `/auth/logout-all` | Bearer | Revoke every session             |

### Users — `/users`

| Method | Endpoint             | Auth   | Description          |
| ------ | -------------------- | ------ | -------------------- |
| GET    | `/users/me`          | Bearer | Current profile      |
| PATCH  | `/users/me`          | Bearer | Update profile       |
| PATCH  | `/users/me/password` | Bearer | Change password      |
| DELETE | `/users/me`          | Bearer | Soft-delete account  |
| GET    | `/users/me/sessions` | Bearer | List active sessions |

### Subscriptions — `/subscriptions`

| Method | Endpoint                   | Auth   | Description          |
| ------ | -------------------------- | ------ | -------------------- |
| GET    | `/subscriptions/plans`     | Public | List plans           |
| GET    | `/subscriptions/me`        | Bearer | Current subscription |
| POST   | `/subscriptions/upgrade`   | Bearer | Upgrade to PREMIUM   |
| POST   | `/subscriptions/downgrade` | Bearer | Downgrade to FREE    |
| GET    | `/subscriptions/usage`     | Bearer | Usage counters       |
| GET    | `/subscriptions/remaining` | Bearer | Remaining quota      |

### AI Providers — `/providers`

| Method | Endpoint                 | Auth   | Description                  |
| ------ | ------------------------ | ------ | ---------------------------- |
| GET    | `/providers`             | Bearer | List user + system providers |
| POST   | `/providers`             | Bearer | Add a provider               |
| GET    | `/providers/:id`         | Bearer | Get one (key masked)         |
| PATCH  | `/providers/:id`         | Bearer | Update                       |
| DELETE | `/providers/:id`         | Bearer | Soft-delete                  |
| PATCH  | `/providers/:id/enable`  | Bearer | Enable                       |
| PATCH  | `/providers/:id/disable` | Bearer | Disable                      |
| PATCH  | `/providers/:id/default` | Bearer | Set default                  |
| GET    | `/providers/health`      | Bearer | Health-check all             |
| GET    | `/providers/:id/health`  | Bearer | Health-check one             |

### Chat — `/chat`

| Method | Endpoint                      | Auth   | Description               |
| ------ | ----------------------------- | ------ | ------------------------- |
| POST   | `/chat/completions`           | Bearer | Send prompt, get response |
| GET    | `/chat/sessions`              | Bearer | List conversations        |
| POST   | `/chat/sessions`              | Bearer | Create conversation       |
| GET    | `/chat/sessions/:id`          | Bearer | Get conversation          |
| PATCH  | `/chat/sessions/:id`          | Bearer | Rename conversation       |
| DELETE | `/chat/sessions/:id`          | Bearer | Delete conversation       |
| GET    | `/chat/sessions/:id/messages` | Bearer | Paginated messages        |

### Web Search — `/search`

| Method | Endpoint              | Auth   | Description              |
| ------ | --------------------- | ------ | ------------------------ |
| POST   | `/search`             | Bearer | Run a query              |
| GET    | `/search/history`     | Bearer | Paginated history        |
| GET    | `/search/recent`      | Bearer | Last 10 searches         |
| GET    | `/search/suggestions` | Bearer | Suggestions from history |
| DELETE | `/search/history/:id` | Bearer | Delete one entry         |
| DELETE | `/search/history`     | Bearer | Clear all                |

### Admin — `/admin` (role: `ADMIN`)

| Method | Endpoint                   | Description                     |
| ------ | -------------------------- | ------------------------------- |
| GET    | `/admin/dashboard`         | Dashboard statistics            |
| GET    | `/admin/analytics/usage`   | Requests over time              |
| GET    | `/admin/users`             | List users (search + paginated) |
| GET    | `/admin/users/:id`         | User detail                     |
| PATCH  | `/admin/users/:id/status`  | Activate / deactivate           |
| PATCH  | `/admin/users/:id/roles`   | Replace roles                   |
| DELETE | `/admin/users/:id`         | Soft-delete                     |
| GET    | `/admin/subscriptions`     | All subscriptions               |
| PATCH  | `/admin/subscriptions/:id` | Update plan or status           |
| GET    | `/admin/providers`         | All providers                   |
| GET    | `/admin/logs`              | API usage logs (filtered)       |
| GET    | `/admin/health`            | System health                   |

### Health — `/health`

| Method | Endpoint     | Auth   | Description    |
| ------ | ------------ | ------ | -------------- |
| GET    | `/health`    | Public | Liveness probe |
| GET    | `/health/db` | Public | Postgres ping  |

---

## Database Schema

### Entity Relationship Overview

```

User ──1:N── Session
User ──1:N── ApiUsageLog
User ──1:1── Subscription
User ──M:N── Role (via user_roles)
User ──1:N── ChatSession ──1:N── ChatMessage
User ──1:N── WebSearch ──1:N── WebSearchResult
Plan ──1:N── Subscription
AiProvider ──1:N── ChatMessage
AiProvider ──1:N── ApiUsageLog

```

### Tables

| Table                | Purpose             | Key Columns                                             |
| -------------------- | ------------------- | ------------------------------------------------------- |
| `users`              | Accounts            | email (unique), password_hash, is_active, deleted_at    |
| `roles`              | Available roles     | name (ADMIN, USER)                                      |
| `user_roles`         | User ↔ Role join    | user_id, role_id                                        |
| `sessions`           | Refresh token store | user_id, refresh_token_hash, expires_at, revoked_at     |
| `plans`              | Subscription tiers  | name, request_limit, search_limit, provider_limit       |
| `subscriptions`      | User subscriptions  | user_id (unique), plan_id, requests_used, period_end    |
| `ai_providers`       | AI provider configs | user_id (nullable), type, api_key_encrypted, is_default |
| `chat_sessions`      | Conversations       | user_id, title, provider_id                             |
| `chat_messages`      | Individual messages | session_id, role, content, tokens_*, latency_ms         |
| `web_searches`       | Search history      | user_id, query, result_count, cached                    |
| `web_search_results` | Search results      | search_id, title, url, position                         |
| `api_usage_logs`     | Request audit       | user_id, endpoint, status_code, latency_ms              |

### Indexes

| Index                                    | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `users.email` (unique)                   | Login lookup                  |
| `sessions.refresh_token_hash`            | Refresh token rotation lookup |
| `subscriptions.user_id` (unique)         | One subscription per user     |
| `ai_providers.user_id`                   | Provider list per user        |
| `chat_sessions.(user_id, updated_at)`    | Recent conversations          |
| `chat_messages.(session_id, created_at)` | Ordered message fetch         |
| `web_searches.(user_id, created_at)`     | Recent searches               |
| `api_usage_logs.created_at`              | Analytics time-range queries  |

### Migrations

```bash
# Generate a migration from entity diff
npm run migration:generate --name=AddSomeColumn

# Create an empty migration (write SQL by hand)
npm run migration:create --name=CustomIndex

# Apply pending migrations
npm run migration:run

# Roll back the last migration
npm run migration:revert

# Show status
npm run typeorm -- migration:show
```

**Rules:**

- `synchronize` is **always** `false`
- Every migration is committed to `src/database/migrations/`
- Never edit an applied migration — create a new one

---

## Environment Variables

Full reference for `.env`. See `.env.example` for the template.

### Application

| Variable     | Default       | Description                             |
| ------------ | ------------- | --------------------------------------- |
| `NODE_ENV`   | `development` | `development` \| `test` \| `production` |
| `PORT`       | `3000`        | HTTP port                               |
| `API_PREFIX` | `api/v1`      | Global route prefix                     |
| `APP_NAME`   | `EchoGPT API` | Display name                            |

### Database

| Variable      | Default | Description                                 |
| ------------- | ------- | ------------------------------------------- |
| `DB_HOST`     | —       | Postgres host                               |
| `DB_PORT`     | `5432`  | Postgres port                               |
| `DB_USER`     | —       | Postgres user                               |
| `DB_PASSWORD` | —       | Postgres password                           |
| `DB_NAME`     | —       | Postgres database                           |
| `DB_SSL`      | `false` | Enable SSL (auto-on in production)          |
| `DB_LOGGING`  | `false` | Query logging (disabled in prod regardless) |

> `synchronize` is not configurable — schema changes only via migrations.

### JWT

| Variable                 | Default | Description                               |
| ------------------------ | ------- | ----------------------------------------- |
| `JWT_ACCESS_SECRET`      | —       | Access token signing secret (≥ 32 chars)  |
| `JWT_ACCESS_EXPIRES_IN`  | `15m`   | Access token lifetime                     |
| `JWT_REFRESH_SECRET`     | —       | Refresh token signing secret (≥ 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | `7d`    | Refresh token lifetime                    |

### Encryption

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `ENCRYPTION_KEY` | 64-char hex (32 bytes) — AES-256-GCM key for provider API keys |

Generate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Cache & Rate Limiting

| Variable         | Default | Description                        |
| ---------------- | ------- | ---------------------------------- |
| `REDIS_URL`      | —       | Redis connection string (optional) |
| `THROTTLE_TTL`   | `60`    | Rate-limit window in seconds       |
| `THROTTLE_LIMIT` | `60`    | Max requests per window            |

### Web Search

| Variable         | Default                      | Description                       |
| ---------------- | ---------------------------- | --------------------------------- |
| `SEARCH_API_URL` | `https://api.duckduckgo.com` | Search provider URL               |
| `SEARCH_API_KEY` | —                            | Search provider key (if required) |

### Swagger

| Variable          | Default    | Description                                            |
| ----------------- | ---------- | ------------------------------------------------------ |
| `SWAGGER_ENABLED` | `true`     | Enable Swagger UI (auto-off in prod unless set `true`) |
| `SWAGGER_PATH`    | `api/docs` | Swagger UI path                                        |

### Seeds

| Variable              | Default                 |
| --------------------- | ----------------------- |
| `SEED_ADMIN_EMAIL`    | `admin@echogpt.local`   |
| `SEED_ADMIN_PASSWORD` | `Admin@123`             |
| `SEED_USER_EMAIL`     | `user@echogpt.local`    |
| `SEED_USER_PASSWORD`  | `User@123`              |
| `OPENAI_SEED_KEY`     | `sk-placeholder-openai` |
| `CLAUDE_SEED_KEY`     | `sk-placeholder-claude` |
| `GEMINI_SEED_KEY`     | `sk-placeholder-gemini` |

---

## Project Structure

```
echogpt-backend/
├── src/
│   ├── main.ts                        # Bootstrap: pipes, filters, guards, Swagger
│   ├── app.module.ts                  # Root module — wires everything
│   │
│   ├── config/                        # Typed, validated configuration
│   │   ├── configuration.ts
│   │   ├── env.validation.ts
│   │   └── swagger.config.ts
│   │
│   ├── common/                        # Cross-cutting utilities
│   │   ├── constants/                 # Roles, plans, providers enums
│   │   ├── decorators/                # @Public, @Roles, @CurrentUser
│   │   ├── dto/                       # PaginationQueryDto, ApiResponseDto
│   │   ├── entities/                  # BaseEntity (id, timestamps, soft delete)
│   │   ├── filters/                   # AllExceptionsFilter
│   │   ├── guards/                    # JwtAuthGuard, RolesGuard
│   │   ├── interceptors/              # TransformInterceptor
│   │   ├── interfaces/                # AuthenticatedUser, JwtPayload
│   │   ├── pipes/                     # ParseUuidPipe
│   │   └── utils/                     # crypto, hash, pagination helpers
│   │
│   ├── database/                      # Persistence infrastructure
│   │   ├── data-source.ts             # DataSource for TypeORM CLI
│   │   ├── database.module.ts         # TypeOrmModule.forRootAsync
│   │   ├── migrations/                # All *.ts migrations
│   │   └── seeds/                     # Idempotent seed scripts
│   │       ├── run-seed.ts
│   │       ├── roles.seed.ts
│   │       ├── plans.seed.ts
│   │       ├── users.seed.ts
│   │       └── providers.seed.ts
│   │
│   └── modules/                       # Feature modules
│       ├── auth/                      # Register, login, refresh, logout
│       ├── users/                     # Profile, password, roles bootstrap
│       ├── sessions/                  # Refresh token storage
│       ├── subscriptions/             # Plans, quotas, upgrades
│       ├── providers/                 # AI providers + adapters
│       ├── chat/                      # Chat + sessions + messages
│       ├── search/                    # Web search + history
│       ├── usage/                     # API usage logging
│       ├── admin/                     # Admin panel APIs
│       └── health/                    # Liveness + DB health
│
│
├── test/                              # E2E tests
│   └── jest-e2e.json
│
├── .env.example                       # Environment template
├── .dockerignore
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── Dockerfile                         # Multi-stage production image
├── docker-compose.yml                 # Dev stack
├── docker-compose.prod.yml            # Production overlay
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Security

### Authentication & Tokens

| Concern               | Measure                                                        |
| --------------------- | -------------------------------------------------------------- |
| Password storage      | bcrypt with cost factor 12                                     |
| Access tokens         | Short-lived (15m), signed with HS256                           |
| Refresh tokens        | Long-lived (7d), rotated on every use                          |
| Refresh token storage | SHA-256 hash only — raw token never persisted                  |
| Session binding       | JWT `sid` claim equals session PK — prevents token swap        |
| Suspicious activity   | On `sid` or `sub` mismatch, session is revoked                 |
| Logout                | Revokes the current session; `logout-all` revokes every device |

### Authorization

- Global `JwtAuthGuard` — every route requires auth **unless** marked `@Public()`
- Global `RolesGuard` — enforces `@Roles(...)` decorator
- Admin routes guarded at controller level with `@Roles(RoleName.ADMIN)`
- Resource ownership checked at the service layer (`findOwnedOrSystem`, `findOne({ where: { id, userId } })`)

### Secrets & Encryption

| Concern           | Measure                                                        |
| ----------------- | -------------------------------------------------------------- |
| Provider API keys | AES-256-GCM at rest, never returned raw (masked: `sk-...1234`) |
| Encryption key    | Supplied via `ENCRYPTION_KEY`, 32 bytes hex, never logged      |
| JWT secrets       | 48 bytes base64url minimum, rotated via env                    |
| Config validation | `class-validator` schema fails boot on missing/invalid env     |

### Transport & Request Handling

- **Helmet** — standard security headers
- **CORS** — strict allowlist in production, permissive in dev
- **Throttler** — 10 req/min on `/auth/login` and `/auth/register`, 30 req/min on `/chat/completions`
- **ValidationPipe** — `whitelist: true`, `forbidNonWhitelisted: true` — rejects unknown fields
- **Logging** — no secrets, tokens, or full auth bodies logged

### Data Integrity

- Foreign keys with explicit `onDelete` behavior
- Transactions for multi-step writes (register user + subscription)
- Soft deletes via `@DeleteDateColumn` — no accidental data loss
- Migrations are the only path to schema change (`synchronize: false` everywhere)

### Production Hardening

- `synchronize` hardcoded to `false`
- Swagger disabled by default when `NODE_ENV=production`
- Query logging disabled in production
- SSL forced on by default in production
- Stack traces never leaked in HTTP responses
- Non-root user in the Docker runtime image

### Reporting a Vulnerability

If you find a security issue, please email **mdrabiulkhanbabo@gmail.com** rather than opening a public issue. Include:

- Affected endpoint or file
- Reproduction steps
- Impact assessment (if known)

---

## Scripts Reference

| Script                                | Description                         |
| ------------------------------------- | ----------------------------------- |
| `npm run start:dev`                   | Start with hot reload               |
| `npm run start:debug`                 | Start with inspector                |
| `npm run start:prod`                  | Run compiled output                 |
| `npm run build`                       | Compile to `dist/`                  |
| `npm run lint`                        | ESLint with autofix                 |
| `npm run format`                      | Prettier                            |
| `npm run test`                        | Unit tests                          |
| `npm run test:e2e`                    | E2E tests                           |
| `npm run test:cov`                    | Coverage report                     |
| `npm run migration:generate --name=X` | Generate migration from entity diff |
| `npm run migration:create --name=X`   | Empty migration (hand-written SQL)  |
| `npm run migration:run`               | Apply pending migrations            |
| `npm run migration:revert`            | Roll back last migration            |
| `npm run schema:drop`                 | Drop schema (dev only)              |
| `npm run db:seed`                     | Insert reference + demo data        |
| `npm run db:seed -- --update`         | Refresh features and limits         |

---

## Contributing

1. Branch from `develop`: `git checkout -b feat/your-feature`
2. Follow Conventional Commits:
   - `feat(auth): add forgot-password endpoint`
   - `fix(providers): enforce single default provider per user`
   - `docs(swagger): document chat streaming`
3. Before pushing:
   ```bash
   npm run lint && npm run format && npm run test && npm run build
   ```
4. Open a PR against `develop` with a clear description of the change.

---

## License

**UNLICENSED** — internal assignment submission for AppifyDevs.

---

## Acknowledgements

- [NestJS](https://nestjs.com) — modular Node.js framework
- [TypeORM](https://typeorm.io) — TypeScript ORM
- [PostgreSQL](https://www.postgresql.org) — relational database
- [Passport](https://www.passportjs.org) — authentication middleware
- [Swagger / OpenAPI](https://swagger.io) — API documentation
