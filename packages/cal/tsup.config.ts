import { defineConfig } from "tsup";

// @hanzo/cal ships as built ESM + types. Everything heavy is EXTERNAL: the atoms
// bundle (and its `globals.min.css` side-effect import), React, and dayjs (plus
// its plugin subpaths) stay bare imports the consumer resolves — so the consumer's
// bundler dedupes a single dayjs/React instance shared with the atoms. `treeshake`
// is off and the package declares `sideEffects: true`, so the dayjs.extend() and
// the CSS import are NEVER dropped — that is the fix for the atoms' own
// `sideEffects: false` tree-shake that undefined'd dayjs.tz in production.
export default defineConfig({
  entry: { index: "src/index.tsx" },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  treeshake: false,
  target: "es2020",
  external: [/^@calcom\/atoms/, "react", "react-dom", /^react\//, /^dayjs/],
});
