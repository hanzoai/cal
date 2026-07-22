// @hanzo/calendar — Hanzo-branded booking components.
//
// This is the debranded fork surface of Cal.com's @calcom/atoms (MIT — see the
// NOTICE file). The SPA at cal.hanzo.ai imports ONLY from here, never from
// @calcom/atoms directly: the Cal provider and Booker are re-exported under Hanzo
// names and defaulted for public, no-OAuth booking against the native Hanzo Base
// backend at /v1/calendar. Cal's look and feel (its Tailwind styling) ships with
// the atoms and is intentionally preserved — this is Cal's Booker, Hanzo-hosted.

import { CalProvider, Booker as CalBooker } from "@calcom/atoms";
import type { ComponentProps, ReactNode } from "react";

// Cal's atom styles (Tailwind, pre-built). Importing here means a consumer only has
// to import "@hanzo/calendar" to get both the components and their look.
import "@calcom/atoms/globals.min.css";

/** Default Base backend for the booking API. Override with VITE_CAL_API. */
export const DEFAULT_CALENDAR_API = "https://api.hanzo.ai/v1/calendar";

export type ProviderProps = {
  /** Base backend booking API, e.g. https://api.hanzo.ai/v1/calendar */
  apiUrl?: string;
  children: ReactNode;
};

/**
 * Provider wraps Cal's CalProvider for public booking: no OAuth client, no managed
 * user — just an API base pointed at Hanzo Base. Cal's provider sets
 * axios.defaults.baseURL = apiUrl, so every Booker request hits our host, and it
 * initializes from apiUrl alone (an empty clientId skips the OAuth client fetch).
 */
export function Provider({ apiUrl = DEFAULT_CALENDAR_API, children }: ProviderProps) {
  return (
    <CalProvider clientId="" options={{ apiUrl }} version="2024-08-13">
      {children}
    </CalProvider>
  );
}

/** Booker is Cal's public Booker, re-exported under the Hanzo surface. */
export const Booker = CalBooker;
export type BookerProps = ComponentProps<typeof CalBooker>;
