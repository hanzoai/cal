import { Booker } from "@hanzo/booker";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown } from "../analytics";
import { Page } from "../Page";

/** The query names a link may fill the details step with, as a Cal.com link does. */
const PREFILL = ["name", "email", "notes"] as const;

// The public booking page: the native Hanzo <Booker> (universal Tamagui, on
// @hanzo/booker) for /{owner}/{slug}, pointed at the native /v1/calendar backend.
// On success we route to the confirmation view by the new booking's uid.
//
// `?name=`, `?email=` and `?notes=` fill in the details step: hanzo.ai's sales
// page sends its visitor here with the answers they already gave. They are read
// once and taken off the address before anything reports the page, because
// @hanzo/event stamps the URL on every event and an attendee is not the
// warehouse's to keep.
export function Booking() {
  const { owner = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const target = { host: owner, eventSlug: slug };
  const [prefill] = useState(() => {
    const q = new URLSearchParams(window.location.search);
    return Object.fromEntries(PREFILL.map((k) => [k, q.get(k) ?? undefined]));
  });

  useLayoutEffect(() => {
    const url = new URL(window.location.href);
    if (!PREFILL.some((k) => url.searchParams.has(k))) return;
    for (const k of PREFILL) url.searchParams.delete(k);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useShown("page", target);

  return (
    <Page>
      <Booker
        host={owner}
        eventSlug={slug}
        apiUrl={calendarApi}
        prefill={prefill}
        onBooked={(booking) => {
          booked("page", target);
          if (booking?.uid) navigate(`/booking/${booking.uid}`);
        }}
      />
    </Page>
  );
}
