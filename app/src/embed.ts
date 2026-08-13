// The host-page loader. One classic script, no framework, no dependencies:
//
//   <div data-hanzo-cal="pk_aGFuem8vaW50cm8"></div>
//   <button data-hanzo-cal="pk_aGFuem8vaW50cm8" data-hanzo-cal-popup>Book</button>
//   <script async src="https://cal.hanzo.ai/embed.js"></script>
//
// Every booker is a frame, so the host's stylesheets cannot reach the UI and
// ours cannot reach theirs. What a frame cannot do is size itself, so the
// embedded document reports its height and we apply it here.
//
// Also on window.HanzoCal for pages that build their DOM after load:
// HanzoCal.mount(el), HanzoCal.open(pk), HanzoCal.close().

const KEY = "data-hanzo-cal";
const POPUP = "data-hanzo-cal-popup";
const MOUNTED = "data-hanzo-cal-mounted";

// A frame reports the height of its own content. Past this it is not reporting a
// booker, and a page that accepts any number has agreed to be papered over.
const MAX_HEIGHT = 5000;

type Style = Record<string, string>;

const FRAME: Style = {
  display: "block",
  width: "100%",
  border: "0",
  background: "transparent",
};
const INLINE: Style = { ...FRAME, height: "640px" };
const SCRIM: Style = {
  position: "fixed",
  inset: "0",
  "z-index": "2147483647",
  display: "flex",
  "align-items": "center",
  "justify-content": "center",
  padding: "16px",
  background: "rgba(0,0,0,.6)",
};
const PANEL: Style = {
  display: "flex",
  "flex-direction": "column",
  width: "100%",
  "max-width": "900px",
  height: "90vh",
  "max-height": "760px",
  "border-radius": "12px",
  overflow: "hidden",
  "background-color": "#0b0b0d",
};
const BAR: Style = {
  display: "flex",
  "align-items": "center",
  "justify-content": "space-between",
  gap: "12px",
  padding: "10px 14px",
  "font-family": "system-ui, -apple-system, sans-serif",
  "font-size": "13px",
  "line-height": "1.2",
  color: "#f3f4f6",
  "background-color": "#0b0b0d",
};
const LABEL: Style = {
  "font-family": "system-ui, -apple-system, sans-serif",
  "font-size": "13px",
  color: "#9ca3af",
};
const DISMISS: Style = {
  "font-family": "system-ui, -apple-system, sans-serif",
  "font-size": "13px",
  color: "#f3f4f6",
  background: "transparent",
  border: "0",
  padding: "2px 6px",
  cursor: "pointer",
};
const MODAL: Style = { ...FRAME, flex: "1 1 auto", "min-height": "0" };

// `all:initial` drops everything the element was inheriting, and !important on
// an inline declaration is the one thing a host's `iframe { border: … }` cannot
// outrank — including their own !important.
function apply(el: HTMLElement, style: Style): void {
  el.style.setProperty("all", "initial", "important");
  for (const k in style) el.style.setProperty(k, style[k], "important");
}

// Where this script came from is where the booker is served from, so one build
// works on any deployment.
const origin = new URL(
  (document.currentScript as HTMLScriptElement | null)?.src || location.href
).origin;

const inline: HTMLIFrameElement[] = [];
let scrim: HTMLElement | null = null;
let popup: HTMLIFrameElement | null = null;

// `parent` is the address the booker answers to. Without it the booker posts to
// whatever surrounds it, and a page that never asked for one could read what it
// says.
function frame(pk: string, surface: "inline" | "popup", style: Style): HTMLIFrameElement {
  const el = document.createElement("iframe");
  el.src =
    `${origin}/embed?pk=${encodeURIComponent(pk)}&surface=${surface}` +
    `&parent=${encodeURIComponent(location.origin)}`;
  el.title = "Book a time";
  apply(el, style);
  return el;
}

/** mount turns one [data-hanzo-cal] element into a booker — inline by default,
 *  or a click that opens the popup when it also carries [data-hanzo-cal-popup]. */
export function mount(el: Element): void {
  const pk = el.getAttribute(KEY);
  if (!pk || el.hasAttribute(MOUNTED)) return;
  el.setAttribute(MOUNTED, "");

  if (el.hasAttribute(POPUP)) {
    el.addEventListener("click", () => open(pk));
    return;
  }
  const f = frame(pk, "inline", INLINE);
  el.appendChild(f);
  inline.push(f);
}

/** open shows the booker over the page, under a bar naming who is serving it.
 *
 *  The popup covers the whole viewport, and `data-*` is what survives an HTML
 *  sanitizer — so a page that takes user HTML can be made to open one without
 *  ever running a script. The bar is why that is not worth doing: it is drawn in
 *  this script's own DOM with `all:initial !important`, so the host's CSS cannot
 *  hide it and an injection with no script cannot remove it, and it says the
 *  overlay is cal.hanzo.ai's, not the page's. */
export function open(pk: string): void {
  close();
  const root = document.createElement("div");
  apply(root, SCRIM);

  const panel = document.createElement("div");
  apply(panel, PANEL);

  const bar = document.createElement("div");
  apply(bar, BAR);
  const who = document.createElement("span");
  apply(who, LABEL);
  who.textContent = new URL(origin).host;
  const dismiss = document.createElement("button");
  apply(dismiss, DISMISS);
  dismiss.textContent = "Close";
  dismiss.addEventListener("click", () => close());
  bar.append(who, dismiss);

  popup = frame(pk, "popup", MODAL);
  panel.append(bar, popup);
  root.appendChild(panel);
  root.addEventListener("click", (e) => {
    if (e.target === root) close();
  });
  document.body.appendChild(root);
  document.addEventListener("keydown", onKey);
  scrim = root;
}

/** close dismisses the popup. */
export function close(): void {
  if (!scrim) return;
  scrim.remove();
  scrim = null;
  popup = null;
  document.removeEventListener("keydown", onKey);
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") close();
}

// The embedded document is the only thing we listen to, and only for the two
// things it is allowed to ask for. Both are bound to the frame entitled to ask:
// close to the open popup, height to the inline frame that reported it. Right
// origin, wrong frame — two bookers on one page, one Escape — is how a dialog
// closes on somebody else's visitor.
window.addEventListener("message", (e: MessageEvent) => {
  if (e.origin !== origin) return;
  const msg = e.data as { source?: string; type?: string; height?: number } | null;
  if (!msg || msg.source !== "hanzo-cal") return;

  if (msg.type === "close") {
    if (popup && e.source === popup.contentWindow) close();
    return;
  }
  if (msg.type === "height" && typeof msg.height === "number") {
    const f = inline.find((x) => x.contentWindow === e.source);
    const h = Math.min(Math.max(msg.height, 0), MAX_HEIGHT);
    if (f) f.style.setProperty("height", `${h}px`, "important");
  }
});

function scan(): void {
  document.querySelectorAll(`[${KEY}]`).forEach(mount);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", scan);
} else {
  scan();
}
