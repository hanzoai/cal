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
- `Dockerfile` — self-contained multi-stage: stage 1 builds the Vite bundle with
  the pinned pnpm; stage 2 is `FROM ghcr.io/hanzoai/spa` and copies the bundle to
  `/public` (SPA fallback). A fresh `docker build .` needs no pre-built `app/dist`
  (it is gitignored), so CI and local builds are identical.
- `.github/workflows/cicd.yml` — native CI. Every job pins the self-hosted Hanzo
  pool `hanzo-build-linux-amd64` (`runs-on`) — never a GitHub-hosted runner, so
  zero GHA minutes. On push it builds+pushes `ghcr.io/hanzoai/cal:sha-<short>`.
  The same `.github` file also runs on the git.hanzo.ai forge, whose runner scans
  `WORKFLOW_DIRS = .hanzo/workflows,.github/workflows,.gitea/workflows`. Deploy is
  a gated CTO step (pin the tag on the `cal` App CR); CI never deploys.
- `deploy/mirror-to-forge.sh` — point the git.hanzo.ai mirror at the GitHub
  canonical via server-side mirror-IN (the forge fetches from GitHub; idempotent
  resync). Auth is the `hanzo auth token` JWT, kept out of argv.
- `deploy/base-native/cicd.yml` — the paired base image workflow, prepared for
  post-red apply to `hanzoai/base/.github/workflows/`.

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
the immutable npm publish is the follow-on.

## Homing
Canonical origin is GitHub `github.com/hanzoai/cal`; git.hanzo.ai `hanzo/cal` is a
downstream mirror and the native CI executor. (The repo is `cal`, not `calendar`,
because `github.com/hanzoai/calendar` is a full fork of `calcom/cal.diy` — a
different artifact; the forge org is `hanzo`, it has no `hanzoai` org.)
