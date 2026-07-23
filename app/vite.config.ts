import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);
const stripeStub = fileURLToPath(new URL("./src/stripe-stub.ts", import.meta.url));
const stripeReactStub = fileURLToPath(new URL("./src/stripe-react-stub.tsx", import.meta.url));

// zustand/traditional (the Booker's stores) imports the named export
// `useSyncExternalStoreWithSelector` from use-sync-external-store's shim barrel,
// which is a CJS file with a conditional dev/prod `require` that Rollup can't
// statically read named exports from — so the namespace resolves to {} and the
// Booker crashes at render (`aue is not a function`). Alias the barrel straight
// to the concrete production file (plain `exports.useSyncExternalStoreWithSelector`),
// which Rollup's commonjs interop DOES synthesize a named export from.
const shimBarrel = require.resolve("use-sync-external-store/shim/with-selector");
const withSelectorProd =
  shimBarrel.slice(0, shimBarrel.indexOf("/shim/")) +
  "/cjs/use-sync-external-store-shim/with-selector.production.js";

// The @hanzo/calendar workspace package is TS source; pnpm symlinks it to its real
// path outside node_modules, so Vite transpiles it. @calcom/atoms is consumed as
// its pre-built ESM bundle. NODE_ENV is pinned so React and the atoms tree-shake to
// their production paths in the browser.
export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["dayjs", "react", "react-dom", "use-sync-external-store"],
    alias: {
      // Route the shim barrel (and its .js form) to the concrete production file.
      "use-sync-external-store/shim/with-selector.js": withSelectorProd,
      "use-sync-external-store/shim/with-selector": withSelectorProd,
      // Public booking is free; stub Stripe so the optional peer import resolves
      // and the bundle stays self-contained (no external SDK, CSP-clean).
      "@stripe/stripe-js/pure": stripeStub,
      "@stripe/stripe-js": stripeStub,
      "@stripe/react-stripe-js": stripeReactStub,
    },
  },
  optimizeDeps: {
    // zustand/traditional (the Booker stores) needs the use-sync-external-store
    // shim; pre-bundle it so esbuild CJS->ESM interop resolves the named export
    // useSyncExternalStoreWithSelector (else the Booker crashes: aue is not a function).
    include: ["zustand", "zustand/traditional", "use-sync-external-store/shim/with-selector"],
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
