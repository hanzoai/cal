import { defineConfig } from "vite";

// The host-page loader ships as one classic script at a stable URL, /embed.js,
// so it builds on its own: no React, no hashed chunk, nothing a third party has
// to know the name of. It lands in the SPA's dist, so it runs after the SPA
// build and must not empty the directory.
export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    target: "es2018",
    lib: {
      entry: "src/embed.ts",
      formats: ["iife"],
      name: "HanzoCal",
      fileName: () => "embed.js",
    },
  },
});
