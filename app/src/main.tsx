import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";

import { GuiProvider } from "hanzogui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { config } from "./gui";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GuiProvider config={config} defaultTheme="dark">
      <App />
    </GuiProvider>
  </StrictMode>
);
