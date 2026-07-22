# cal.hanzo.ai — Cal's Booker on native Hanzo Base

Public booking page: Cal.com's real `<Booker>` UI, powered entirely by the native
Hanzo Base backend at `/v1/calendar`. No Cal Prisma/Postgres, no Cal Node API — the
booking is created in Base.

## Layout
- `packages/calendar` — **`@hanzo/calendar`**, the debranded fork surface. A thin
  Hanzo-namespaced wrapper over the published `@calcom/atoms` (MIT — see `NOTICE`):
  re-exports `Provider` (Cal's `CalProvider`, defaulted for public no-OAuth booking)
  and `Booker` under Hanzo names, and owns the atoms' style side-effect import. The
  SPA imports ONLY from here, never `@calcom/atoms` directly.
- `app` — the Vite + React SPA (`@hanzo/cal-app`). Routes: `/` landing,
  `/{owner}/{slug}` the Booker, `/booking/{uid}` confirmation + cancel.
- `Dockerfile` — `FROM ghcr.io/hanzoai/spa`, `COPY app/dist /public` (SPA fallback).

## Backend contract
`<Provider apiUrl>` sets `axios.defaults.baseURL`, so every atom request hits our
host. Point it at Base's `/v1/calendar` (default `https://cal.hanzo.ai/v1/calendar`,
override with `VITE_CAL_API`). The backend is the `calendar` plugin in
`github.com/hanzoai/base` (`plugins/calendar`), which speaks Cal's API-v2 shapes.

## Build
```
pnpm install
pnpm build          # -> app/dist
```
Public booking is free, so Cal's optional Stripe peers are aliased to local no-op
stubs (`app/src/stripe-*.ts`) — the bundle stays self-contained and CSP-clean.

## Fork discipline
Only MIT `@calcom/atoms` is used; no `ee/` / non-MIT Cal code. Cal's copyright stays
in `NOTICE`, Hanzo's added. Phase-1 milestone is a local/workspace `@hanzo/calendar`;
the immutable npm publish + `github.com/hanzoai/calendar` repo are the follow-on.
