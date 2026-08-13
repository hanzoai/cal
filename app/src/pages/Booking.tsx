import { Booker } from "@hanzo/booker";
import { useNavigate, useParams } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown } from "../analytics";

// The public booking page: the native Hanzo <Booker> (universal Tamagui, on
// @hanzo/booker) for /{owner}/{slug}, pointed at the native /v1/calendar backend.
// On success we route to the confirmation view by the new booking's uid.
export function Booking() {
  const { owner = "", slug = "" } = useParams();
  const navigate = useNavigate();
  const target = { host: owner, eventSlug: slug };

  useShown("page", target);

  return (
    <Booker
      host={owner}
      eventSlug={slug}
      apiUrl={calendarApi}
      onBooked={(booking) => {
        booked("page", target);
        if (booking?.uid) navigate(`/booking/${booking.uid}`);
      }}
    />
  );
}
