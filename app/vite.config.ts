import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const stripeStub = fileURLToPath(new URL("./src/stripe-stub.ts", import.meta.url));
const stripeReactStub = fileURLToPath(new URL("./src/stripe-react-stub.tsx", import.meta.url));

// The @hanzo/calendar workspace package is TS source; pnpm symlinks it to its real
// path outside node_modules, so Vite transpiles it. @calcom/atoms is consumed as
// its pre-built ESM bundle. NODE_ENV is pinned so React and the atoms tree-shake to
// their production paths in the browser.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["dayjs", "react", "react-dom"],
    alias: {
      // Public booking is free; stub Stripe so the optional peer import resolves
      // and the bundle stays self-contained (no external SDK, CSP-clean).
      "@stripe/stripe-js/pure": stripeStub,
      "@stripe/stripe-js": stripeStub,
      "@stripe/react-stripe-js": stripeReactStub,
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      treeshake: {
        // @calcom/atoms declares sideEffects:false, so the bundler drops its
        // `import "./vendor/dayjs/index.js"` (which runs dayjs.extend(utc,
        // timezone, …)). Without it dayjs.tz is undefined and the Booker crashes
        // at bootstrap on dayjs.tz.guess(). Treat the atoms as side-effectful so
        // that extend import is preserved; everything else keeps default DCE.
        moduleSideEffects: (id) =>
          id.includes("@calcom/atoms") || id.includes("dayjs") ? true : "no-external",
      },
    },
  },
});
