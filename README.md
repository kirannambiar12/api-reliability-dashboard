# API Reliability Dashboard (Next.js App Router)

This is a small internal dashboard to monitor the health and reliability of public APIs.

## Screenshots / Flows

- **Empty state**
  - `public/Empty State.png`
- **Loading state**
  - `public/Loading State.png`
- **With data added**
  - `public/with data.png`
- **Delete confirmation modal**
  - `public/Delete confirmation modal.png`
- **Error state**
  - `public/Error state.png`
- **Name already exists**
  - `public/Name already exists.png`
- **URL already exists**
  - `public/Url already exists.png`

## Requirements Covered (from the assignment)

### Dashboard page

For each service, the UI shows:

- **Service name**
- **Status** (`UP | SLOW | DOWN`)
- **Response latency (ms)** (`latencyMs`)
- **Last checked timestamp** (`lastCheckedAt`, ISO string)
- **Health score**

### Service management

- **Add a service** (name + URL)
- **Delete a service**
- **Manually refresh** a service’s health status
- **Local persistence** using a JSON file (`data/services.json`)

## Status classification logic

Status values are **`UP`**, **`SLOW`**, and **`DOWN`**.

- **UP**: HTTP 2xx and response time \< 500ms
- **SLOW**: HTTP 2xx and response time ≥ 500ms and \< 2000ms
- **DOWN**: non-2xx response, network failure, timeout, or latency ≥ 2000ms

The health check returns these fields:

- `id` (string)
- `name` (string)
- `status` (`UP | SLOW | DOWN`)
- `latencyMs` (number)
- `lastCheckedAt` (ISO timestamp string)
- `healthScore` (number)

## API routes

- **List services / Add service**
  - `GET app/api/services/route.ts`
  - `POST app/api/services/route.ts`
- **Delete a service**
  - `DELETE app/api/services/[id]/route.ts`
- **Refresh one service**
  - `POST app/api/services/[id]/refresh/route.ts`
- **Refresh all services (parallel)**
  - `POST app/api/services/refresh/route.ts`

Client helpers live in `lib/api-client.ts`. API path constants live in `lib/dashboard-constants.ts`.

## Local storage

- `data/services.json` stores the services.
- `lib/store.ts` handles JSON read/write and basic CRUD.

## Tests

I added small unit tests for core logic:

- **Health logic**: `lib/tests/health.test.ts`
- **Validation**: `lib/tests/validators.test.ts`

Screenshots:

- `public/Test Pass.png`
- `public/Test Fail.png`

## Developer tooling (to keep the repo clean)

### Prettier

- Used for consistent formatting across the codebase.

### Husky (pre-commit)

Pre-commit runs:

- `npm run lint`
- `npm run format:check`
- `npm run test`

Config: `.husky/pre-commit`

## Folder structure (high level)

- `.husky/`: Husky hooks
- `app/`: Next.js App Router pages and API routes
  - `app/api/`: API endpoints
- `components/`: UI components
  - `components/reusable/`: reusable core UI components
  - `components/ui/`: dashboard-specific UI
- `data/`: local persistence (JSON)
- `lib/`: types, constants, utilities, validators, health logic

## Live demo

Hosted at: https://kn-ard.vercel.app/
