# TaskFlow

A full-stack task management application with Kanban boards, real-time updates, and dark mode.

**Stack:** Node.js + Express + TypeScript (backend) | React + TypeScript + Chakra UI (frontend) | PostgreSQL | Docker

> **Language choice:** Go is preferred per the spec; I chose Node.js because it is my strongest language and allows me to deliver the most polished, complete submission — including all bonus features — within the time constraint. The architecture (raw SQL, hand-written migrations, layered services) demonstrates the same fundamentals the Go version would.

## Architecture Decisions

| Decision | Rationale |
|---|---|
| **Node.js over Go** | Stronger proficiency = higher quality in limited time. Same architectural patterns apply. |
| **Raw SQL via node-postgres** | No ORM. Every query is hand-written SQL. Full spec compliance — no Prisma, no Sequelize. |
| **golang-migrate for migrations** | Hand-written `.up.sql` and `.down.sql` files. Auto-runs on container start via `entrypoint.sh`. Not `prisma db push` or `sync()`. |
| **SSE over WebSocket** | Simpler than WebSocket — no upgrade handshake, works over HTTP/1.1, native browser `EventSource` API. No extra infrastructure needed. |
| **@dnd-kit over react-beautiful-dnd** | Actively maintained, smaller bundle, better accessibility. `react-beautiful-dnd` is deprecated. |
| **Chakra UI v2** | Built-in dark mode, accessible components, responsive grid system. Saves significant UI development time. |
| **Zod for validation** | Schema-first, TypeScript-native. Generates types from schemas — single source of truth. |
| **Pino for logging** | Structured JSON logging, fast, equivalent to Go's `slog`/`zap`. |
| **Global User Assignments over Strict Project Auth** | Allowed any user to be assigned to a task globally instead of implementing a rigid Many-to-Many project membership table, promoting agile collaboration and faster feature validation. |
| **Dual View Modes (Kanban + List)** | Developed a drag-and-drop Kanban view alongside a responsive Data Table list view for high-density reading. State resets cleanly using React keys (`key={"board-" + statusFilter}`) mitigating `@dnd-kit` caching edge-cases on view toggles. |

## Running Locally

### Prerequisites
- Docker Desktop installed and running
- Git

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd taskflow

# 2. Copy environment file
cp .env.example .env

# 3. Start everything (DB, backend, frontend)
docker compose up --build

# 4. Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

That's it. No manual migration commands, no seed scripts, no npm install. Everything runs automatically.

## Running Migrations

Migrations run automatically on container start via `entrypoint.sh`. For manual reference:

```bash
# Run migrations up
docker compose exec backend migrate -path /app/migrations -database "$DATABASE_URL" up

# Rollback
docker compose exec backend migrate -path /app/migrations -database "$DATABASE_URL" down 1
```

Migration files: `backend/migrations/000001_init.up.sql` and `000001_init.down.sql`

## Test Credentials

```
Email:    test@example.com
Password: password123
```

These are seeded automatically on first startup.

## API Reference

### Auth
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| POST | `/auth/register` | No | 201 | Returns `{ token, user }` |
| POST | `/auth/login` | No | 200 | Returns `{ token, user }` |

### Projects
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/projects` | Yes | 200 | Paginated: `?page=&limit=` |
| POST | `/projects` | Yes | 201 | `owner_id` = authenticated user |
| GET | `/projects/:id` | Yes | 200 | Project + tasks array |
| PATCH | `/projects/:id` | Yes | 200 | 403 if not owner |
| DELETE | `/projects/:id` | Yes | 204 | Cascades to tasks; 403 if not owner |
| GET | `/projects/:id/stats` | Yes | 200 | **Bonus:** counts by status and assignee |
| GET | `/projects/:id/events` | Yes | 200 | **Bonus:** SSE stream for real-time |

### Tasks
| Method | Endpoint | Auth | Status | Notes |
|--------|----------|------|--------|-------|
| GET | `/projects/:id/tasks` | Yes | 200 | Filters: `?status=&assignee=&page=&limit=` |
| POST | `/projects/:id/tasks` | Yes | 201 | |
| PATCH | `/tasks/:id` | Yes | 200 | Partial update, all fields optional |
| DELETE | `/tasks/:id` | Yes | 204 | 403 unless project owner or assignee |

### Error Responses
- **400** — `{ "error": "validation failed", "fields": { "field": "message" } }`
- **401** — Not authenticated (missing/invalid JWT)
- **403** — Authenticated but not authorized
- **404** — `{ "error": "resource not found" }`

## Bonus Features Implemented

All 6 bonus features are implemented:

1. **Pagination** (+5pts) — All list endpoints support `?page=&limit=` with response envelope `{ data, total, page, limit }`
2. **Stats endpoint** (+5pts) — `GET /projects/:id/stats` returns task counts by status and by assignee
3. **Integration tests** (+5pts) — 3 tests: auth flow, 401 on unauthenticated access, task creation round-trip
4. **Dark mode** — Chakra UI toggle, persists to localStorage
5. **Drag-and-drop** — Kanban board with @dnd-kit, drag tasks between status columns
6. **Real-time SSE** — Live task updates without page refresh via Server-Sent Events

## Running Tests

```bash
# Requires a running PostgreSQL instance (use docker compose)
docker compose up db -d
cd backend && npm test
```

## What I'd Do With More Time

### Auth & Security
- **Refresh token rotation** — Replace 24h non-revocable JWTs with short-lived access tokens (15min) + long-lived refresh tokens stored in a `refresh_tokens` table; invalidate on logout or suspicious activity
- **Rate limiting** — Apply `express-rate-limit` + Redis sliding window on `/auth/login` and `/auth/register`; separate stricter limits on password-sensitive routes
- **RBAC on projects** — Replace global user assignments with a `project_members(project_id, user_id, role)` join table; enforce `owner | editor | viewer` at the middleware layer before any route handler runs
- **OAuth / SSO** — Add Google and GitHub OAuth via Passport.js so enterprise teams can use their existing identity provider instead of managing another password

### Real-time & Scalability
- **Upgrade SSE → WebSocket** — Replace `EventSource` with Socket.io rooms keyed by `project_id`; enables bidirectional events (typing indicators, cursor presence, live comment threads) without polling
- **Redis pub/sub for horizontal scaling** — Current in-memory `EventEmitter` registry breaks the moment a second backend replica starts. Replace with a Redis pub/sub channel per project so any pod can broadcast to any connected client
- **BullMQ job queue** — Move slow work (email notifications, webhook delivery, activity log fan-out) off the request thread into Redis-backed queues with retry, backoff, and dead-letter handling

### Data Model & API
- **Paginate `getById` relationships** — Currently, `GET /projects/:id` joins and returns *all* tasks in a single query. At scale (e.g. 50,000 tasks), this will block the Node.js event loop, cause an Out-Of-Memory (OOM) crash, and freeze the browser. Related tasks MUST be paginated on a separate endpoint (`GET /projects/:id/tasks?page=...`).
- **Fix `COALESCE` Update Flaw** — The `UPDATE projects SET description = COALESCE($2, description)` query prevents users from ever clearing out a description once it is set (passing `null` falls back to the old value). The SQL string should be built dynamically based on the provided keys in the DTO.
- **UUIDv7 over UUIDv4** — The `init.up.sql` migration uses `gen_random_uuid()` (v4) for primary keys. v4 UUIDs are entirely random, which causes severe B-Tree index fragmentation and degrades `INSERT` performance under high write loads. A sequential ID like UUIDv7 or ULID should be used instead.
- **Cursor-based pagination** — Replace `OFFSET/LIMIT` with `WHERE id > $cursor ORDER BY id LIMIT n`. `OFFSET` scans and discards rows on disk, degrading query performance linearly on massive tables.
- **Fractional indexing for task ordering** — Add a `position float8` column on `tasks`; use the midpoint algorithm to reorder without updating every row. Enables intra-column drag-and-drop and cross-column positional placement.
- **Row-level locking on concurrent updates** — Wrap task PATCH in `BEGIN; SELECT ... FOR UPDATE; UPDATE; COMMIT` to prevent last-write-wins corruption when two users edit the same task simultaneously.
- **Full-text search** — Add a `tsvector` generated column on `tasks` with a GIN index; expose `GET /search?q=` using `to_tsquery` — no Elasticsearch needed for this scale.

### Frontend
- **Project-scoped Assignee Fetching** — Currently, the frontend calls `userApi.list()` on load, fetching the *entire* world's user base into the browser just to populate assignee names. This crashes if the user base grows. Assignees should be fetched via a SQL `JOIN` on the backend, strictly scoped to the active project.
- **Virtual scrolling for Kanban/List views** — Use `@tanstack/react-virtual` for the list view and board. Rendering thousands of task rows into the DOM causes jank and freezes on low-end devices.
- **Optimistic UI updates** — Apply drag-and-drop edits to local state immediately, fire the PATCH in the background, and roll back with an error toast on failure; eliminates visible latency on board interaction.
- **Keyboard shortcuts & Bulk Actions** — Standardize productivity with `N` to create, `Esc` to close, and checkbox-select multiple tasks for bulk assigning/moving.

### Testing & Observability
- **Service-layer unit tests** — Current tests only hit HTTP endpoints. Extract business logic into service classes and unit-test them with a fake repository so tests run without a database
- **E2E tests with Playwright** — Cover the full drag-and-drop flow, SSE delivery, and auth redirect — things the current integration tests cannot reach
- **Structured tracing** — Add `correlation-id` middleware that stamps every log line and outbound query with a request ID; pair with OpenTelemetry traces so a slow endpoint can be traced to a specific SQL query in production
- **Health + readiness endpoints** — `GET /healthz` (process alive) and `GET /readyz` (DB reachable) for Kubernetes liveness/readiness probes

### Infrastructure & DevOps
- **CI/CD pipeline** — GitHub Actions: lint → type-check → unit tests → integration tests against a service container → Docker build + push to GHCR on merge to `main`
- **PgBouncer connection pooling** — Node.js creates a new PG connection per pool slot; under load this exhausts Postgres `max_connections`. PgBouncer in transaction mode sits in front and multiplexes hundreds of app connections onto a small number of real PG connections
- **Database migrations in CI** — Run `migrate up` against a fresh Postgres container in the test job to catch broken migrations before they reach production
- **Blue-green deployments** — Zero-downtime deploys by routing traffic to the new container only after its `/readyz` passes; the current `docker compose up` approach takes the app down during every redeploy
