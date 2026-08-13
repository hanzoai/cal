// The booking funnel, on the fleet's analytics plane: @hanzo/event batches to
// POST {host}/v1/event. One client for the whole app; AnalyticsProvider in
// main.tsx starts it.
//
// The taxonomy in @hanzo/event is closed on purpose — a dimension is a property,
// never a new event name — so the funnel rides the conversion names it shares a
// shape with, qualified by kind:'booking'. That keeps free intro calls out of
// the Sale goal, which reads order_completed{kind:'plan'}.
//
//   booker presented  ->  pricing_viewed  { kind:'booking', surface, host, eventType }
//   booking created   ->  order_completed { kind:'booking', surface, host, eventType }
//
// Only the two public identifiers ride along. Never the booking uid: it is the
// capability that reveals the meeting location and cancels the booking.

import { EVENTS, createAnalytics } from "@hanzo/event";
import { useEffect } from "react";

import type { Target } from "./pk";

/** Where the booker was presented to the visitor. */
export type Surface = "page" | "hero" | "inline" | "popup";

// Every refusal signal a browser can raise, in the spelling hz.js already
// honors: Global Privacy Control, Do Not Track on navigator (both "1" and the
// older "yes"), on window, and Microsoft's. The SDK reads none of them — each
// surface decides its own consent.
//
// Framed, the client is off entirely. The id it stamps on an event is the
// fleet's hz_anon_id, read from a cookie on hanzo.ai that every Hanzo surface
// shares; reading it inside someone else's page is what would turn a booker
// into a cross-site tracker, and the events would be attributed to a visitor
// who came to read that page, not ours. A booker embedded in someone else's
// page is the polite one.
function permitted(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const w = window as Window & { doNotTrack?: string };
  if (n.globalPrivacyControl === true) return false;
  if (n.doNotTrack === "1" || n.doNotTrack === "yes") return false;
  if (w.doNotTrack === "1" || n.msDoNotTrack === "1") return false;
  return window.parent === window;
}

export const analytics = createAnalytics({
  product: "cal",
  host: import.meta.env.VITE_EVENT_HOST || "https://api.hanzo.ai",
  // A pk- ingest key attributes anonymous writes. Without one the client still
  // POSTs — it drops the Authorization header, nothing else — so an unkeyed fork
  // is unattributed at the door, not silent. What keeps it quiet is `enabled`
  // and the fact that nothing here reports a page it was not asked to.
  ingestKey: import.meta.env.VITE_PUBLISHABLE_KEY || undefined,
  enabled: permitted(),
});

function step(surface: Surface, t: Target) {
  return { kind: "booking", surface, host: t.host, eventType: t.eventSlug };
}

/** shown reports that the booker reached the visitor — the top of the funnel. */
export function useShown(surface: Surface, t: Target | null): void {
  const host = t?.host;
  const eventSlug = t?.eventSlug;
  useEffect(() => {
    if (host && eventSlug) {
      analytics.capture(EVENTS.PRICING_VIEWED, step(surface, { host, eventSlug }));
    }
  }, [surface, host, eventSlug]);
}

/** booked reports the conversion. */
export function booked(surface: Surface, t: Target): void {
  analytics.capture(EVENTS.ORDER_COMPLETED, step(surface, t));
}

// A key that names no calendar reports nothing. captureError was the wrong
// instrument twice: it put the verbatim ?pk= — a string the caller picks, of no
// bounded length — into a row on the shared warehouse, and it flushes on the
// spot, so one load became one POST of a page anyone can load in a loop. A
// selector that doesn't resolve is a mistyped host page, not a fault: the
// visitor is told on the page, and the missing pricing_viewed is the signal.
