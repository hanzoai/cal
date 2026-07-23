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
ENV HANZO_STATIC_CSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; media-src 'self' https:"
EXPOSE 3000
