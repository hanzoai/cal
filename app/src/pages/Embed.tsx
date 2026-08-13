import { Booker } from "@hanzo/booker";
import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, keyRejected, useShown, type Surface } from "../analytics";
import { resolve } from "../pk";

// The document a host page frames: the same <Booker> against the same
// /v1/calendar backend, with nothing else on the page. The publishable key in
// the query names the calendar; the frame is what keeps the host's CSS out.
export function Embed() {
  const [params] = useSearchParams();
  const pk = params.get("pk") ?? "";
  const surface: Surface = params.get("surface") === "popup" ? "popup" : "inline";
  const target = resolve(pk);

  useTransparentPage();
  usePostedHeight();
  useEscapeToClose();
  useShown(surface, target);

  useEffect(() => {
    if (!target) keyRejected(pk);
  }, [target, pk]);

  if (!target) {
    return (
      <main className="embed">
        <p className="muted">This booking key doesn't name a calendar.</p>
      </main>
    );
  }

  return (
    <main className="embed">
      <Booker
        host={target.host}
        eventSlug={target.eventSlug}
        apiUrl={calendarApi}
        onBooked={() => booked(surface, target)}
      />
    </main>
  );
}

// An embedded document paints no background of its own, so the booker sits on
// whatever the host page already has.
function useTransparentPage() {
  useEffect(() => {
    document.documentElement.classList.add("framed");
    return () => document.documentElement.classList.remove("framed");
  }, []);
}

// Escape pressed inside a frame never reaches the page around it, so a visitor
// typing in the form would have no way out of the popup. Pass it up; the loader
// ignores it unless a popup is open.
function useEscapeToClose() {
  useEffect(() => {
    if (window.parent === window) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        window.parent.postMessage({ source: "hanzo-cal", type: "close" }, "*");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}

// An iframe cannot size itself to its content, so the content reports its
// height and the loader on the host page applies it.
function usePostedHeight() {
  const last = useRef(0);
  useEffect(() => {
    if (window.parent === window) return;
    const post = () => {
      const height = Math.ceil(document.documentElement.scrollHeight);
      if (height === last.current) return;
      last.current = height;
      window.parent.postMessage({ source: "hanzo-cal", type: "height", height }, "*");
    };
    const observer = new ResizeObserver(post);
    observer.observe(document.documentElement);
    post();
    return () => observer.disconnect();
  }, []);
}
