import { Booker } from "@hanzo/booker";
import { useNavigate } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown } from "../analytics";
import { Page } from "../Page";
import { TEAM } from "../team";

// Clean booking page — no marketing, just direct scheduling with the team
export function Home() {
  const navigate = useNavigate();

  useShown("page", TEAM);

  return (
    <Page>
      <Booker
        host={TEAM.host}
        eventSlug={TEAM.eventSlug}
        hostName={TEAM.name}
        apiUrl={calendarApi}
        onBooked={(booking) => {
          booked("page", TEAM);
          if (booking?.uid) navigate(`/booking/${booking.uid}`);
        }}
      />
    </Page>
  );
}
