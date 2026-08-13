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

type Style = Record<string, string>;

const FRAME: Style = {
  display: "block",
  width: "100%",
  border: "0",
  background: "transparent",
};
const INLINE: Style = { ...FRAME, height: "640px" };
const MODAL: Style = {
  ...FRAME,
  "max-width": "900px",
  height: "90vh",
  "max-height": "760px",
  "border-radius": "12px",
};
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

function frame(pk: string, surface: "inline" | "popup", style: Style): HTMLIFrameElement {
  const el = document.createElement("iframe");
  el.src = `${origin}/embed?pk=${encodeURIComponent(pk)}&surface=${surface}`;
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

/** open shows the booker over the page. */
export function open(pk: string): void {
  close();
  const root = document.createElement("div");
  apply(root, SCRIM);
  root.appendChild(frame(pk, "popup", MODAL));
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
  document.removeEventListener("keydown", onKey);
}

function onKey(e: KeyboardEvent): void {
  if (e.key === "Escape") close();
}

// The embedded document is the only thing we listen to, and only for the two
// things it is allowed to ask for.
window.addEventListener("message", (e: MessageEvent) => {
  if (e.origin !== origin) return;
  const msg = e.data as { source?: string; type?: string; height?: number } | null;
  if (!msg || msg.source !== "hanzo-cal") return;

  if (msg.type === "close") {
    close();
    return;
  }
  if (msg.type === "height" && typeof msg.height === "number") {
    const f = inline.find((x) => x.contentWindow === e.source);
    if (f) f.style.setProperty("height", `${msg.height}px`, "important");
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
