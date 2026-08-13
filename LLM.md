# cal.hanzo.ai — the Booker on native Hanzo Base

Public booking page and embeddable booker, powered entirely by the native Hanzo
Base backend at `/v1/calendar`. No Cal Prisma/Postgres, no Cal Node API — the
booking is created in Base.

## Layout
- `app` — the Vite + React SPA (`@hanzo/cal-app`). Routes: `/` landing,
  `/{owner}/{slug}` the Booker, `/booking/{uid}` confirmation + cancel, `/embed`
  the framed Booker a third-party page loads.
- `Dockerfile` — self-contained multi-stage: stage 1 builds the Vite bundle with
  the pinned pnpm; stage 2 is `FROM ghcr.io/hanzoai/spa` and copies the bundle to
  `/public` (SPA fallback). A fresh `docker build .` needs no pre-built `app/dist`
  (it is gitignored), so CI and local builds are identical.
- `.hanzo/workflows/deploy.yml` — native CI on the self-hosted pool
  `hanzo-build-linux-amd64`; builds and pushes `ghcr.io/hanzoai/cal:sha-<short>`.
  It never deploys: the rollout is a reviewed tag pin on the `cal` App CR in
  `hanzoai/universe`, and cd.hanzo.ai's selfHeal would undo anything CI patched.
- `deploy/mirror-to-forge.sh` — server-side mirror-IN resync (idempotent).

## The UI package
`@hanzo/booker` (published from `hanzoai/gui/pkgs/calendar`) — a universal
(web + native) Booker built on hanzogui primitives, pinned at `^0.1.0`. It is
NOT Cal's atoms; it re-implements the flow and speaks Cal's API-v2 shapes.

Two build facts follow from it and are easy to trip over:
- `@hanzo/booker` imports its peer under the name `hanzogui`. Vite aliases that
  to `@hanzo/gui`; `app/tsconfig.json` repeats the alias in `paths`, or the type
  checker cannot resolve it. Change one, change both.
- Do not chase `@hanzo/booker@8.x`: it peer-requires `@hanzo/gui >= 8`, and the
  app is pinned to the 7.3.0 line. 8.1.1 adds no props 0.1.0 lacks.

## Backend contract
`app/src/api.ts` resolves the base (`VITE_CAL_API`, default `/v1/calendar`), and
every request is made by `@hanzo/booker`'s own fetch layer. Base's `calendar`
plugin (`hanzoai/base`, `plugins/calendar`) serves, all unauthenticated:

| route | use |
|---|---|
| `GET /atoms/event-types/{slug}/public?username={host}` | the public event-type config |
| `GET /slots/available?eventTypeSlug=&usernameList=&startTime=&endTime=&timeZone=` | availability |
| `POST /bookings` | create (201) |
| `GET /bookings/{uid}` · `POST /bookings/{uid}/cancel` | read + cancel |

Envelope is Cal's: `{status:"success", data}` / `{status:"error", error:{message}}`.
The `(host, slug)` pair is the ONLY public identifier the backend takes — there is
no endpoint that maps an opaque key to a calendar, and none that lists a host's
event types. A booking `uid` is a capability: it reveals the real meeting location
and cancels the booking, so it never leaves the booking page.

## The embed
- `app/src/embed.ts` → built by `app/vite.embed.config.ts` to the fixed URL
  `/embed.js`, a ~2 kB classic IIFE with no React. It is a SEPARATE vite build
  that runs after the SPA build with `emptyOutDir:false`; the SPA build must go
  first or it wipes the loader.
- Every booker is an iframe pointed at `/embed?pk=…&surface=…`, which is what
  isolates host CSS. The loader's own elements are styled with
  `setProperty(…, "important")` over `all:initial` — inline+important is the one
  declaration a host's `iframe { border: … !important }` cannot outrank.
- An iframe cannot size itself, so `/embed` posts its height on a ResizeObserver
  and the loader applies it; the same channel carries `close` so Escape pressed
  INSIDE the frame can dismiss a popup (a keypress in a frame never reaches the
  page around it). The loader checks `e.origin` and matches `e.source` against
  the frames it made.
- `ALLOW_FRAMING=true` is set in the Dockerfile because `ghcr.io/hanzoai/spa`
  otherwise sends `X-Frame-Options: DENY` + `frame-ancestors 'none'` and the
  embed silently refuses to render. (That server reads `SPA_CSP`, not the
  `HANZO_STATIC_CSP` also set there.)

## The publishable key
`app/src/pk.ts`. `pk_` + base64url(`<host>/<eventSlug>`) — self-describing, so it
resolves with no lookup and no registry, then the public config comes from the
event-type endpoint above. It authorizes nothing and names only what the public
URL already names.

Base reserves the HYPHENATED `pk-` for read-only API credentials, and a global
middleware 403s any non-GET carrying one. This key is a different kind of value
and is never sent as a credential — not as `Authorization`, and not as `?key=`,
which is the query name that middleware reads.

## The funnel
`app/src/analytics.ts`, on `@hanzo/event` (the fleet's client tracker → `POST
{host}/v1/event`), started by `AnalyticsProvider` in `main.tsx`.

The taxonomy in `@hanzo/event` is closed on purpose — a dimension is a property,
never a new event name — so the funnel rides the conversion names, qualified by
`kind:'booking'`, which also keeps free intro calls out of the Sale goal
(`order_completed{kind:'plan'}`):

- `pricing_viewed {kind, surface, host, eventType}` — the booker reached a visitor
- `order_completed {kind, surface, host, eventType}` — a booking was created
- `surface` is `page` | `hero` | `inline` | `popup`
- a key that names nothing goes to the error plane, not the funnel

Only the two public identifiers ride along; never the booking uid, never the
attendee. `VITE_PUBLISHABLE_KEY` (a `pk-` ingest key) attributes anonymous
traffic — without one the plane is inert. DNT and GPC are honoured here because
the SDK reads neither.

**Interior steps are not emitted, and cannot be from this repo.** `<Booker>`'s
only lifecycle prop is `onBooked`; `slot_selected` and `details_entered` live in
its private state machine. Getting them means one prop upstream in
`hanzoai/gui/pkgs/calendar` — `onStep?: (step) => void` on `BookerProps`, called
from `useBooker`'s `selectSlot` / `submit` / the failed-submit branch — not a
fork of the UI here and not a wrapper around `fetch`.

## Homing
Canonical origin is the forge, `git.hanzo.ai/hanzoai/cal`, which is also the CI
executor. (The repo is `cal`, not `calendar`, because `hanzoai/calendar` is a
full fork of `calcom/cal.diy` — a different artifact.)
