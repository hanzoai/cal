import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

import { GuiProvider } from "hanzogui";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { config } from "./gui";
import "./styles.css";

// No StrictMode: its double-invoke trips a Tamagui update-depth loop on the
// marketing page's embedded booker. The Booker itself is idempotent in prod.
createRoot(document.getElementById("root")!).render(
  <GuiProvider config={config} defaultTheme="dark">
    <App />
  </GuiProvider>
);
