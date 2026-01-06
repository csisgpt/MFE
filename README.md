# CSIS Vue Module Federation (Nx + Vite)

A production-grade Nx monorepo showcasing Vue 3 + Vite micro-frontends with Module Federation via `@module-federation/vite`.

## Architecture Overview
- **Shell host** (`apps/shell`) owns routing, layout, auth, runtime config, and global UI.
- **Remotes**
  - `apps/app-one` (legacy)
  - `apps/app-two` (legacy)
  - `apps/insurance` (organizational)
  - `apps/admission` (organizational)
  - `apps/ops` (organizational)
- **Shared libs** (`libs/shared/*`) provide config, stores, auth, API client, UI adapters, styles, and assets.

### Same-origin proxy (why it matters)
The shell proxies all remote assets through the shell origin:
- `/remotes/app-one/*` → `http://csis.ir:4991/*`
- `/remotes/app-two/*` → `http://csis.ir:4992/*`
- `/remotes/insurance/*` → `http://csis.ir:4993/*`
- `/remotes/admission/*` → `http://csis.ir:4994/*`
- `/remotes/ops/*` → `http://csis.ir:4995/*`

This prevents CORS and “chunk-origin” errors by ensuring **all remote entries and chunks are fetched from the shell origin**.

## Repo Structure
```
apps/
  shell/
  app-one/
  app-two/
  insurance/
  admission/
  ops/
libs/
  shared/
    config/
    styles/
    assets/
    store/
    api-client/
    auth/
    ui/
    contracts/
    observability/
    permissions/
```

## Hosts File Setup
Add the following line to your hosts file:
```
127.0.0.1 csis.ir
```

## Running Locally (Dev)
> Uses fixed ports and same-origin proxying.

```bash
pnpm install
pnpm nx serve app-one
pnpm nx serve app-two
pnpm nx serve insurance
pnpm nx serve admission
pnpm nx serve ops
pnpm nx serve shell
```

Or run all in parallel:
```bash
pnpm nx run-many -t serve --projects=app-one,app-two,insurance,admission,ops,shell --parallel
```

### Optional: Remote standalone dev
Remotes default to same-origin proxying (base `/remotes/...`). To run a remote standalone at its root:
```bash
pnpm nx serve insurance --configuration=standalone
pnpm nx serve admission --configuration=standalone
pnpm nx serve ops --configuration=standalone
```

Windows-friendly alternative:
```bash
pnpm nx run insurance:serve --configuration=standalone
```

## Build + Preview
```bash
pnpm nx build app-one
pnpm nx build app-two
pnpm nx build insurance
pnpm nx build admission
pnpm nx build ops
pnpm nx build shell

pnpm nx preview app-one
pnpm nx preview app-two
pnpm nx preview insurance
pnpm nx preview admission
pnpm nx preview ops
pnpm nx preview shell
```

### Integrated preview with same-origin proxies
Vite preview does not apply dev proxies, so use the integrated preview server for the shell:
```bash
pnpm nx preview app-one
pnpm nx preview app-two
pnpm nx preview insurance
pnpm nx preview admission
pnpm nx preview ops
pnpm nx preview:integrated shell
```

### Prod-like dev
1. Build and preview remotes.
2. Run the shell dev server.

## Shared Libraries
- **`shared/config`**: runtime config loader (`/config/runtime.json`) with safe defaults and remote prefix helper.
- **`shared/styles`**: Tailwind v4 CSS-first setup (`tokens.css`, `base.css`, `fonts.css`).
- **`shared/assets`**: fonts and static assets.
- **`shared/store`**: host Pinia bridge + global stores + event bus.
- **`shared/api-client`**: fetch wrapper with token injection, request IDs, and audit events.
- **`shared/auth`**: auth helpers + route guard.
- **`shared/ui`**: UI adapter layer for Ant Design Vue + PrimeVue.
- **`shared/contracts`**: DTOs, event payloads, and permission keys.
- **`shared/observability`**: logger + request ID generator.
- **`shared/permissions`**: RBAC helpers.

### Tailwind v4 style sharing
`libs/shared/styles/src/index.ts` is imported globally by each app to avoid missing tokens in standalone mode. Tailwind v4 is CSS-first and configured through PostCSS (`@tailwindcss/postcss`).

### Vendor CSS strategy
Ant Design Vue + PrimeVue CSS is imported once from `@shared/ui/styles` in the shell. Remotes only import it when running standalone (`VITE_STANDALONE=true`).

## Module Federation
- Host loads remoteEntry via same-origin paths:
  - `http://csis.ir:4990/remotes/app-one/remoteEntry.js`
  - `http://csis.ir:4990/remotes/app-two/remoteEntry.js`
  - `http://csis.ir:4990/remotes/insurance/remoteEntry.js`
  - `http://csis.ir:4990/remotes/admission/remoteEntry.js`
  - `http://csis.ir:4990/remotes/ops/remoteEntry.js`
- Shared singletons: **vue**, **pinia**, **vue-router**

## MFE Trust Features
- `/system` system status page with remote status, retry, and disable toggles.
- `/audit` audit page with request/error history and filters.
- RemoteLoader with timeout, fallback UI, and retry.
- Remote prefetch on hover in shell navigation.
- RBAC permission gating for approve/decision/report creation flows.
- Request IDs + logging in the shared API client.
- Global error capture for shell runtime errors.
- Shared DTO contracts for mock API + event bus.

## Mock API (Shell)
Provided by the shell dev server:
- Insurance
  - `GET /api/mock/insurance/requests`
  - `POST /api/mock/insurance/requests`
  - `GET /api/mock/insurance/requests/:id`
  - `PUT /api/mock/insurance/requests/:id`
  - `POST /api/mock/insurance/admin/requests/:id/approve`
  - `POST /api/mock/insurance/admin/requests/:id/reject`
  - `GET /api/mock/insurance/claims`
  - `POST /api/mock/insurance/claims`
  - `GET /api/mock/insurance/policies`
  - `POST /api/mock/insurance/policies`
  - `PUT /api/mock/insurance/policies`
- Admission
  - `GET /api/mock/admission/applications`
  - `POST /api/mock/admission/applications`
  - `GET /api/mock/admission/applications/:id`
  - `PUT /api/mock/admission/applications/:id/review`
  - `POST /api/mock/admission/applications/:id/decision`
  - `GET /api/mock/admission/config`
  - `PUT /api/mock/admission/config`
- Ops
  - `GET /api/mock/ops/kpis`
  - `GET /api/mock/ops/alerts`
  - `POST /api/mock/ops/alerts/:id/ack`
  - `GET /api/mock/ops/reports`
  - `POST /api/mock/ops/reports`
  - `GET /api/mock/ops/analytics`

Auth token is required (simple check) and injected by the shared API client.

## E2E Tests
Playwright is configured with two flows:
```bash
pnpm playwright test
```

## Add a New Remote (Checklist)
1. Create `apps/app-new` with Vite + Module Federation.
2. Expose `AppNewMount` from the remote.
3. Add proxy in `apps/shell/vite.config.ts`.
4. Add a shell route using `RemoteLoader`.
5. Register shared singletons.
6. Update `/system` list and nav prefetch hook.

## Add a New Shared Lib
1. Create `libs/shared/<lib-name>/src/index.ts`.
2. Add TS path alias in `tsconfig.base.json`.
3. Use imports via `@shared/<lib-name>`.

## Troubleshooting
- **remoteEntry path**: Must be `/remotes/<remote>/remoteEntry.js` from the shell origin.
- **wrong chunk origin**: Ensure remotes use base `/remotes/<remote>/` (default mode).
- **CORS**: Never load remotes directly from `:4991-4995` in the shell.
- **duplicated Vue/Pinia**: Ensure shared singletons are configured in all apps.
- **UI themes**: Import `@shared/ui/styles` only once (shell) unless running standalone.

## Acceptance Checklist
1. `http://csis.ir:4990` loads shell Home.
2. `/login` works; login persists auth state.
3. `/settings` theme toggle persists and affects remotes.
4. `/profile` shows user info; logout works.
5. `/insurance`, `/admission`, `/ops` mount remotes and routes through pages.
6. `/system` shows remote status; retry and disable toggles work.
7. `/audit` shows request logs + events.
8. Insurance flow: create request → approve → status updates.
9. Admission decision updates Ops KPIs.
10. Remotes emit global toasts; shell displays them.
11. No CORS errors; all remote assets load via `/remotes/*`.
12. Nx targets pass: lint/typecheck/test/build.
