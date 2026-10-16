import { bootScript } from "@hanzo/appearance/state";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { SCHEME } from "./src/scheme";

// Hanzo Calendar SPA — hosts the native universal Booker (@hanzo/booker, gui)
// inside <Hanzo> against the /v1/calendar backend. NODE_ENV is pinned so React
// and gui take their production paths in the browser.
//
// gui's substrate is react-native primitives, which on the web is
// react-native-web: the alias maps it, and `.web.*` outranks `.js` so
// react-native-svg (which @hanzo/ui draws icons with) reaches its web build
// rather than its native codegen. Same mapping as hanzo.ai's checkout.
//
// The scheme is painted in <head> before anything renders: a page that decides
// light or dark after React mounts flashes the wrong ground first. So is
// `framed`: an embedded document paints no ground of its own, and decided in an
// effect it showed an opaque slab in the host page until React mounted.
const FRAMED = `if(location.pathname==="/embed")document.documentElement.classList.add("framed")`;
export default defineConfig({
  plugins: [
    react(),
    {
      name: "scheme",
      transformIndexHtml: () => [
        { tag: "script", children: `${FRAMED};${bootScript({ base: SCHEME })}`, injectTo: "head-prepend" },
      ],
    },
  ],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      {
        find: "@react-native/assets-registry/registry",
        replacement: "react-native-web/dist/modules/AssetRegistry",
      },
    ],
    extensions: [".web.js", ".web.jsx", ".web.ts", ".web.tsx", ".mjs", ".js", ".mts", ".ts", ".jsx", ".tsx", ".json"],
    dedupe: ["react", "react-dom", "react-native-web", "@hanzo/gui"],
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  optimizeDeps: {
    esbuildOptions: { target: "es2020" },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
  },
});
