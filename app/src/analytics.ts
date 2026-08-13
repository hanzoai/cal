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

// Do-not-track and Global Privacy Control. The SDK reads neither — each surface
// decides its own consent, and a booker embedded in someone else's page should
// be the polite one.
function permitted(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.doNotTrack !== "1" && n.globalPrivacyControl !== true;
}

export const analytics = createAnalytics({
  product: "cal",
  host: import.meta.env.VITE_EVENT_HOST || "https://api.hanzo.ai",
  // A pk- ingest key attributes anonymous writes; without one the plane is
  // inert, which is the intended default for a fork nobody has keyed yet.
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

/** keyRejected reports a host page carrying a key that names nothing. Not a
 *  funnel step — an integration fault, and the booker renders empty until it is
 *  fixed, so it belongs on the error plane where someone is watching. */
export function keyRejected(pk: string): void {
  analytics.captureError(new Error("publishable key names no calendar"), {
    properties: { pk },
  });
}
