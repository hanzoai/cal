# cal.hanzo.ai — Cal's <Booker> (debranded as @hanzo/calendar) as a static SPA,
# served by hanzoai/spa (Go static server, :3000). `pnpm build` writes the Vite
# bundle to app/dist. The booking (/{host}/{event}) and manage (/booking/{uid})
# routes are client-rendered SPA shells; hanzoai/spa falls back to index.html for
# any client-routed path so the router resolves them and the atoms fetch on mount.
FROM ghcr.io/hanzoai/spa:sha-b9d3a13-amd64
COPY app/dist /public
ENV PORT=3000
ENV ROOT=/public
# Allow same-origin + inline bootstrap (React hydration) and connect-src https: so
# the browser can reach the Base booking API at cal.hanzo.ai/v1/calendar.
ENV HANZO_STATIC_CSP="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; frame-src 'self'; media-src 'self' https:"
EXPOSE 3000
