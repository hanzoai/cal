// The publishable key: a PUBLIC selector naming which calendar and which event
// type an embed books against. It is not a credential — it authorizes nothing,
// carries no identity, and is safe to sit in a host page's HTML, exactly like
// the /{host}/{eventSlug} path it stands for.
//
//   pk_<base64url("<host>/<eventSlug>")>      hanzo/intro -> pk_aGFuem8vaW50cm8
//
// Self-describing, so a key resolves with no lookup and no registry; the public
// config it names is then read from Base at
// GET /v1/calendar/atoms/event-types/{eventSlug}/public?username={host}, which
// <Booker> already calls. Base reserves the hyphenated `pk-` for read-only API
// credentials — a different kind of value, and this one is never sent as one.

/** The calendar and event type a key names — <Booker>'s own props. */
export interface Target {
  /** Calendar owner handle: Base's public booking identifier for a host. */
  host: string;
  /** Event-type slug. */
  eventSlug: string;
}

const PREFIX = "pk_";

// Handles and slugs are URL segments. Anything else in a decoded key is junk
// from a mistyped host page, not a calendar we could ever resolve.
const SEGMENT = /^[\w.-]{1,64}$/;

/** mint returns the key that names a target. */
export function mint(t: Target): string {
  return PREFIX + b64url(`${t.host}/${t.eventSlug}`);
}

/** resolve reads a key back, or null when it names nothing bookable. */
export function resolve(pk: string): Target | null {
  if (!pk.startsWith(PREFIX)) return null;
  const plain = unb64url(pk.slice(PREFIX.length));
  if (plain === null) return null;
  const [host, eventSlug, ...rest] = plain.split("/");
  if (rest.length || !SEGMENT.test(host ?? "") || !SEGMENT.test(eventSlug ?? "")) return null;
  return { host, eventSlug };
}

function b64url(s: string): string {
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64url(s: string): string | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
    return atob(b64);
  } catch {
    return null;
  }
}
