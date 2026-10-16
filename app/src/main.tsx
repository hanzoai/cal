import "@hanzo/font/css";
import "@hanzo/ui/styles.css";
import "./styles.css";

import { AnalyticsProvider } from "@hanzo/event/react";
import { Hanzo } from "@hanzo/ui";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { analytics } from "./analytics";
import { SCHEME } from "./scheme";

// <Hanzo> is the root every Hanzo surface mounts: @hanzo/ui's gui config and
// tokens, so the Booker's fields, pills and placeholder read the same values as
// hanzo.ai's own forms. Its stylesheet is a real file (styles.css above).
//
// No StrictMode: its double-invoke trips a gui update-depth loop on the
// Booker. The Booker itself is idempotent in prod.
//
// autoPageview is off — it defaults ON, and @hanzo/event stamps `url` and `path`
// on every event it builds. One route here is /booking/<uid>, and that uid is the
// booking's capability: it reads the attendee and cancels the meeting. A pageview
// would have carried it to the shared warehouse. Every surface reports itself by
// name in analytics.ts, so the funnel loses nothing by not counting pages.
createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider client={analytics} autoPageview={false}>
    <Hanzo appearance={{ install: SCHEME }}>
      <App />
    </Hanzo>
  </AnalyticsProvider>
);
