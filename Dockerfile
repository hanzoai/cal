# syntax=docker/dockerfile:1
# cal.hanzo.ai — Cal's <Booker> (debranded as @hanzo/cal) as a static SPA,
# served by hanzoai/spa (Go static server, :3000). Self-contained multi-stage:
# stage 1 compiles the Vite bundle with the pinned pnpm; stage 2 serves it. A
# fresh `docker build .` needs no pre-built dist on the host (app/dist is
# gitignored), so CI and local builds are identical.

# --- stage 1: build app/dist ---
FROM node:22-slim AS build
WORKDIR /app
RUN corepack enable
# Manifests first: the install layer caches independently of source edits.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/package.json app/package.json
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
# Sources, then build → app/dist. @hanzo/cal is workspace TS source that
# Vite transpiles; @calcom/atoms is consumed as its pre-built ESM bundle.
COPY . .
RUN pnpm build

# --- stage 2: serve the bundle with the Hanzo static SPA server ---
# hanzoai/spa falls back to index.html for any client-routed path so the SPA
# router resolves /{owner}/{slug} and /booking/{uid} on the client.
FROM ghcr.io/hanzoai/spa:sha-b9d3a13-amd64
COPY --from=build /app/app/dist /public
# Ship the fork attribution alongside the served bundle (MIT @calcom/atoms).
COPY NOTICE /NOTICE
ENV PORT=3000
ENV ROOT=/public
# Allow same-origin + inline bootstrap (React hydration) and connect-src https:
# so the browser can reach the Base booking API at cal.hanzo.ai/v1/calendar.
# The variable is SPA_CSP: that is the name hanzoai/spa reads, and the
# HANZO_STATIC_CSP spelled here before was read by nothing.
#
# It is still read by nothing. hanzoai/spa sets Content-Security-Policy only on
# the branch where framing is refused, so with ALLOW_FRAMING=true it sends no
# policy at all — the whole header, on every path, not just frame-ancestors.
# Confirmed against ghcr.io/hanzoai/spa:sha-b9d3a13: `curl -sI /` returns no CSP
# and no X-Frame-Options. Making this value ship takes a change to that shared
# image — set the CSP unconditionally and let framing choose frame-ancestors
# rather than choose whether there is a policy — and the value below is written
# to be correct the day it does.
ENV SPA_CSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; media-src 'self' https:; frame-ancestors *"
# /embed is meant to be framed by other people's pages, which hanzoai/spa
# otherwise refuses with X-Frame-Options: DENY + frame-ancestors 'none'. The
# allowance is per-server, so it covers /booking/<uid> too — and a uid IS a
# credential: it reads the attendee and cancels the meeting. What framing could
# steal there is a click on Cancel, which is why cancelling takes two.
ENV ALLOW_FRAMING=true
EXPOSE 3000
