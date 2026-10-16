import { Booker } from "@hanzo/booker";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown, type Surface } from "../analytics";
import { resolve } from "../pk";

// The document a host page frames: the same <Booker> against the same
// /v1/calendar backend, with nothing else on the page. The publishable key in
// the query names the calendar; the frame is what keeps the host's CSS out.
export function Embed() {
  const [params] = useSearchParams();
  const pk = params.get("pk") ?? "";
  const surface: Surface = params.get("surface") === "popup" ? "popup" : "inline";
  const target = resolve(pk);
  const parent = loader(params.get("parent"));

  usePostedHeight(parent);
  useEscapeToClose(parent);
  useShown(surface, target);

  if (!target) {
    return (
      <main className="embed">
        <p className="muted">This booking key doesn't name a calendar.</p>
      </main>
    );
  }

  return (
    <main className="embed">
      {/* The popup's panel is already the card, so the Booker draws none. */}
      <Booker
        host={target.host}
        eventSlug={target.eventSlug}
        apiUrl={calendarApi}
        bare={surface === "popup"}
        onBooked={() => booked(surface, target)}
      />
    </main>
  );
}

// The address of every message back to the page around us: embed.js names its
// own origin in ?parent=, and the browser delivers there or nowhere. A "*"
// targetOrigin is delivered to whatever the parent happens to be, and a frame
// chain can be rearranged after load. A bare origin only — a value carrying a
// path is not one — and a frame nobody addressed says nothing.
function loader(raw: string | null): string | null {
  if (!raw) return null;
  try {
    return new URL(raw).origin === raw ? raw : null;
  } catch {
    return null;
  }
}

// Escape pressed inside a frame never reaches the page around it, so a visitor
// typing in the form would have no way out of the popup. Pass it up; the loader
// ignores it unless a popup is open.
function useEscapeToClose(parent: string | null) {
  useEffect(() => {
    if (!parent || window.parent === window) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.parent.postMessage({ source: "hanzo-cal", type: "close" }, parent);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [parent]);
}

// An iframe cannot size itself to its content, so the content reports its
// height and the loader on the host page applies it.
function usePostedHeight(parent: string | null) {
  const last = useRef(0);
  useEffect(() => {
    if (!parent || window.parent === window) return;
    const post = () => {
      const height = Math.ceil(document.documentElement.scrollHeight);
      if (height === last.current) return;
      last.current = height;
      window.parent.postMessage({ source: "hanzo-cal", type: "height", height }, parent);
    };
    const observer = new ResizeObserver(post);
    observer.observe(document.documentElement);
    post();
    return () => observer.disconnect();
  }, [parent]);
}
