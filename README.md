# cal.hanzo.ai

The public booking page for Hanzo: pick a time on someone's calendar and book it.
Live at [cal.hanzo.ai](https://cal.hanzo.ai).

The UI is Cal.com's `Booker` atom; the backend is Hanzo Base at `/v1/calendar`. There is no
Cal.com Prisma, Postgres or Node API in the path — the booking is created in Base.

## Run it locally

```bash
pnpm install
pnpm dev
```

That starts the Vite SPA. Routes are `/` (landing), `/{owner}/{slug}` (the booker) and
`/booking/{uid}` (confirmation and cancel).

```bash
pnpm build        # build every workspace package
docker build .    # self-contained; builds the bundle and serves it from ghcr.io/hanzoai/spa
```

The Docker build needs no pre-built `app/dist`, so a local build and a CI build produce the
same image.

## Layout

- `packages/calendar` — `@hanzo/calendar`, a thin Hanzo-namespaced wrapper over the
  published `@calcom/atoms`. It re-exports `Provider` and `Booker` under Hanzo names and
  owns the atoms' style import. The SPA imports only from here, never `@calcom/atoms`
  directly.
- `app` — the Vite + React SPA, `@hanzo/cal-app`.
- `deploy/` — the forge mirror script and the paired Base workflow.

## CI

`.github/workflows/cicd.yml` runs on the self-hosted `hanzo-build-linux-amd64` pool, never
a GitHub-hosted runner, and pushes `ghcr.io/hanzoai/cal:sha-<short>` on every push. It
never deploys — pinning a tag on the `cal` App CR is a separate, gated step.

## Docs

[`LLM.md`](LLM.md) is the deep reference: the Base seam, the debranding boundary, and the
CI and mirror setup.

## Lineage

The booking UI comes from [Cal.com](https://github.com/calcom/cal.com) via the published
`@calcom/atoms` package (MIT) — see [`NOTICE`](NOTICE). The backend, the wrapper package
and the SPA are ours.
