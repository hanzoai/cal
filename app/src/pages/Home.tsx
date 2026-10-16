import { Booker } from "@hanzo/booker";
import { useNavigate } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown } from "../analytics";

// The team calendar for booking time with Hanzo
const TEAM = { host: "hanzo", eventSlug: "intro" };

// Clean booking page — no marketing, just direct scheduling with the team
export function Home() {
  const navigate = useNavigate();

  useShown("page", TEAM);

  return (
    <main className="landing">
      <header className="nav">
        <span className="brand">
          <img className="brand-mark" src="/logo.svg" alt="" width={22} height={22} />
          Hanzo
        </span>
      </header>

      <section className="booker-stage">
        <div className="booker-frame">
          <Booker
            host={TEAM.host}
            eventSlug={TEAM.eventSlug}
            apiUrl={calendarApi}
            onBooked={(booking) => {
              booked("page", TEAM);
              if (booking?.uid) navigate(`/booking/${booking.uid}`);
            }}
          />
        </div>
      </section>
    </main>
  );
}
