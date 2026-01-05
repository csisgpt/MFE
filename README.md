# CSIS Vue Module Federation (Nx + Vite)

A production-grade Nx monorepo showcasing Vue 3 + Vite micro-frontends with Module Federation via `@module-federation/vite`.

## Architecture Overview
- **Shell host** (`apps/shell`) owns routing, layout, auth, runtime config, and global UI.
- **Remotes** (`apps/app-one`, `apps/app-two`) expose mountable modules loaded by the shell.
- **Shared libs** (`libs/shared/*`) provide config, stores, auth, API client, UI adapters, styles, and assets.

### Same-origin proxy (why it matters)
The shell proxies all remote assets through the shell origin:
- `/remotes/app-one/*` → `http://csis.ir:4991/*`
- `/remotes/app-two/*` → `http://csis.ir:4992/*`

This prevents CORS and “chunk-origin” errors by ensuring **all remote entries and chunks are fetched from the shell origin**.

## Repo Structure
```
apps/
  shell/
  app-one/
  app-two/
libs/
  shared/
    config/
    styles/
    assets/
    store/
    api-client/
    auth/
    ui/
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
pnpm nx serve shell
```

Or run all in parallel:
```bash
pnpm nx run-many -t serve --projects=app-one,app-two,shell --parallel
```

### Optional: Remote standalone dev
Remotes default to same-origin proxying (base `/remotes/...`). To run a remote standalone at its root:
```bash
VITE_STANDALONE=true pnpm nx serve app-one
VITE_STANDALONE=true pnpm nx serve app-two
```

## Build + Preview
```bash
pnpm nx build app-one
pnpm nx build app-two
pnpm nx build shell

pnpm nx preview app-one
pnpm nx preview app-two
pnpm nx preview shell
```

### Prod-like dev
1. Build and preview remotes:
   - `pnpm nx build app-one && pnpm nx preview app-one`
   - `pnpm nx build app-two && pnpm nx preview app-two`
2. Run shell dev server:
   - `pnpm nx serve shell`

## Shared Libraries
- **`shared/config`**: runtime config loader (`/config/runtime.json`) with safe defaults.
- **`shared/styles`**: Tailwind v4 CSS-first setup (`tokens.css`, `base.css`, `fonts.css`).
- **`shared/assets`**: fonts and static assets (placeholder WOFF2s included; replace with real fonts as needed).
- **`shared/store`**: host Pinia bridge + global stores + event bus.
- **`shared/api-client`**: fetch wrapper with token injection and normalized errors.
- **`shared/auth`**: auth helpers + route guard.
- **`shared/ui`**: UI adapter layer for Ant Design Vue + PrimeVue.

### Tailwind v4 style sharing
`libs/shared/styles/src/index.ts` is imported globally by each app to avoid missing styles in standalone mode. This is safe even if duplicated because the styles are deterministic and scoped via CSS variables.

## Module Federation
- Host loads remoteEntry via same-origin paths:
  - `http://csis.ir:4990/remotes/app-one/remoteEntry.js`
  - `http://csis.ir:4990/remotes/app-two/remoteEntry.js`
- Shared singletons: **vue**, **pinia**, **vue-router**

## Mock API (Shell)
Provided by the shell dev server:
- `GET /api/mock/orders`
- `GET /api/mock/orders/:id`
- `POST /api/mock/orders/:id/approve`
- `GET /api/mock/users`
- `POST /api/mock/reports`

Auth token is required (simple check) and injected by the shared API client.

## Add a New Remote (Checklist)
1. Create `apps/app-new` with Vite + Module Federation.
2. Expose `AppNewMount` from the remote.
3. Add proxy in `apps/shell/vite.config.ts`.
4. Add a shell route and a `RemoteWrapper` entry.
5. Register shared singletons.

## Add a New Shared Lib
1. Create `libs/shared/<lib-name>/src/index.ts`.
2. Add TS path alias in `tsconfig.base.json`.
3. Use imports via `@shared/<lib-name>`.

## Troubleshooting
- **remoteEntry path**: Must be `/remotes/<remote>/remoteEntry.js` from the shell origin.
- **wrong chunk origin**: Ensure remotes use base `/remotes/<remote>/` (default mode).
- **CORS**: Never load remotes directly from `:4991` or `:4992` in the shell.
- **duplicated Vue/Pinia**: Ensure shared singletons are configured in all apps.

## Acceptance Checklist
1. `http://csis.ir:4990` loads shell Home.
2. `/login` works; login persists auth state.
3. `/settings` theme toggle persists and affects remotes.
4. `/profile` shows user info; logout works.
5. `/app-one` loads remote and routes through its pages.
6. `/app-two` loads remote and routes through its pages.
7. Remotes call mock API endpoints via shared API client.
8. Reports submit is permission-gated by role.
9. Remotes emit global toasts; shell displays them.
10. No CORS errors; all remote assets load via `/remotes/*`.
11. Nx targets pass: lint/typecheck/test/build.
