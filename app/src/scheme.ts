import type { Preference } from "@hanzo/appearance";

// This surface's own default, under a choice the visitor made: it follows the
// device, light or dark, as hanzo.ai and its checkout do. The boot script in
// index.html paints it before first paint (vite.config.ts); <Hanzo> keeps
// following it after.
export const SCHEME: Preference = { theme: "system" };
