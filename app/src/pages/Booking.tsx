import { Booker, Provider } from "@hanzo/cal";
import { useNavigate, useParams } from "react-router-dom";

import { calendarApi } from "../api";

// The public booking page: Cal's real <Booker> for /{owner}/{slug}, pointed at the
// native Base backend. No access token — public booking needs no managed-user OAuth.
// On success we route to the confirmation view by the new booking's uid.
export function Booking() {
  const { owner = "", slug = "" } = useParams();
  const navigate = useNavigate();

  return (
    <Provider apiUrl={calendarApi}>
      <Booker
        username={owner}
        eventSlug={slug}
        isTeamEvent={false}
        onCreateBookingSuccess={(res: { data?: { uid?: string } }) => {
          const uid = res?.data?.uid;
          if (uid) navigate(`/booking/${uid}`);
        }}
      />
    </Provider>
  );
}
