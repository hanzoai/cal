import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Hanzo Calendar SPA — hosts the native universal Booker (@hanzo/booker, Tamagui)
// against the /v1/calendar backend. The one required piece for Tamagui on web is
// aliasing react-native -> react-native-web and deduping to a single copy each
// (the exact recipe the @hanzo/booker render harness proved). NODE_ENV is pinned
// so React + hanzogui take their production paths in the browser.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      { find: /^hanzogui$/, replacement: "@hanzo/gui" },
    ],
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
