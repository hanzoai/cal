// The team calendar cal.hanzo.ai opens on, and the name people know it by.
//
// The backend's public profile carries no display name — Base's calendar plugin
// answers the booking handle ("hanzo") as the host's name — so the one host this
// app is the home page of is named here, and every page that shows it uses this.
export const TEAM = { host: "hanzo", eventSlug: "intro", name: "Hanzo AI" } as const;

/** The display name for a host, when this app knows a better one than its handle. */
export function hostName(host: string): string | undefined {
  return host === TEAM.host ? TEAM.name : undefined;
}
