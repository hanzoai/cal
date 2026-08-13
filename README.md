# cal.hanzo.ai

The public booking page for Hanzo: pick a time on someone's calendar and book it.
Live at [cal.hanzo.ai](https://cal.hanzo.ai).

The UI is `@hanzo/booker`; the backend is Hanzo Base at `/v1/calendar`. There is no
Cal.com Prisma, Postgres or Node API in the path — the booking is created in Base.

## Run it locally

```bash
pnpm install
pnpm dev
```

That starts the Vite SPA. Routes are `/` (landing), `/{owner}/{slug}` (the booker),
`/booking/{uid}` (confirmation and cancel) and `/embed` (the framed booker).

```bash
pnpm typecheck    # tsc --noEmit across the workspace
pnpm build        # build every workspace package
docker build .    # self-contained; builds the bundle and serves it from ghcr.io/hanzoai/spa
```

The Docker build needs no pre-built `app/dist`, so a local build and a CI build produce the
same image.

## Embed it in your own page

Two lines, no account, no key to keep secret:

```html
<div data-hanzo-cal="pk_aGFuem8vaW50cm8"></div>
<script async src="https://cal.hanzo.ai/embed.js"></script>
```

Add `data-hanzo-cal-popup` to any element to open the booker over the page instead:

```html
<button data-hanzo-cal="pk_aGFuem8vaW50cm8" data-hanzo-cal-popup>Book a time</button>
```

The landing page prints the snippet for its own calendar. For any other, the key is
`pk_` + base64url of `<host>/<eventSlug>` — the same pair as the `/{host}/{eventSlug}`
URL. It is a public selector, not a credential: it authorizes nothing and grants nothing
you could not reach by visiting the booking page.

Each booker is an iframe, so a host page's CSS cannot reach it and ours cannot reach
theirs. The popup opens under a bar naming the site serving it. Pages that build their
DOM after load can call `HanzoCal.mount(el)`, `HanzoCal.open(pk)` and `HanzoCal.close()`.

## Layout

- `app` — the Vite + React SPA, `@hanzo/cal-app`. `src/embed.ts` is the host-page loader,
  built separately to the fixed URL `/embed.js`; `src/pk.ts` is the publishable key;
  `src/analytics.ts` is the booking funnel.
- `deploy/` — the forge mirror script and the paired Base workflow.

## CI

`.hanzo/workflows/deploy.yml` runs on the self-hosted `hanzo-build-linux-amd64` pool,
never a GitHub-hosted runner, and pushes `ghcr.io/hanzoai/cal:sha-<short>` on every push.
It never deploys — pinning a tag on the `cal` App CR is a separate, gated step.

## Docs

[`LLM.md`](LLM.md) is the deep reference: the Base seam, the embed surface, and the CI and
mirror setup.

## Lineage

The booking UI is `@hanzo/booker` (from `hanzoai/gui`), built on hanzogui primitives. It
speaks Cal.com's API-v2 request and response shapes, which Base's `calendar` plugin
serves; earlier revisions embedded Cal.com's own MIT atoms — see [`NOTICE`](NOTICE).
