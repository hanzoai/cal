import "@hanzo/font/css";

import { AnalyticsProvider } from "@hanzo/event/react";
import { GuiProvider } from "hanzogui";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { analytics } from "./analytics";
import { config } from "./gui";
import "./styles.css";

// No StrictMode: its double-invoke trips a Tamagui update-depth loop on the
// marketing page's embedded booker. The Booker itself is idempotent in prod.
//
// autoPageview is off — it defaults ON, and @hanzo/event stamps `url` and `path`
// on every event it builds. One route here is /booking/<uid>, and that uid is the
// booking's capability: it reads the attendee and cancels the meeting. A pageview
// would have carried it to the shared warehouse. Every surface reports itself by
// name in analytics.ts, so the funnel loses nothing by not counting pages.
createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider client={analytics} autoPageview={false}>
    <GuiProvider config={config} defaultTheme="dark">
      <App />
    </GuiProvider>
  </AnalyticsProvider>
);
