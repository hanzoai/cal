import { Booker } from "@hanzo/booker";
import { useNavigate } from "react-router-dom";

import { calendarApi } from "../api";
import { booked, useShown } from "../analytics";
import { mint } from "../pk";

// hanzo.id is the IAM login. Creating/managing your own calendars is auth-gated,
// so both "Sign in" and "Create your calendar" enter through it.
const LOGIN_URL = "https://hanzo.id";

// The calendar the landing page books into, and the one it hands out an embed
// key for — the same pair, so the snippet below always matches what is shown.
const HERO = { host: "hanzo", eventSlug: "intro" };

const FEATURES = [
  {
    title: "Native, not glued together",
    body: "One Go backend on Hanzo Base and IAM. No third-party scheduling service, no data leaving your stack.",
  },
  {
    title: "Connect your calendars",
    body: "Link Google, Microsoft, and CalDAV so real events block your slots and every booking writes back automatically.",
  },
  {
    title: "Never double-booked",
    body: "Availability, buffers, and minimum notice are enforced on every request, with a serialized guard against races.",
  },
  {
    title: "Yours to run",
    body: "Open source, self-hosted, and API-first at api.hanzo.ai/v1/calendar. Embed the booker anywhere.",
  },
];

// The landing at cal.hanzo.ai/. The product itself — the live <Booker> — is the
// hero: pick a time and it books straight into /v1/calendar. Sign-in and calendar
// creation route through hanzo.id (IAM).
export function Home() {
  const navigate = useNavigate();

  useShown("hero", HERO);

  const snippet =
    `<div data-hanzo-cal="${mint(HERO)}"></div>\n` +
    `<script async src="${location.origin}/embed.js"></script>`;

  return (
    <main className="landing">
      <header className="nav">
        <span className="brand">
          <img className="brand-mark" src="/logo.svg" alt="" width={22} height={22} />
          Hanzo Calendar
        </span>
        <nav className="nav-links">
          <a className="nav-link" href={LOGIN_URL}>
            Sign in
          </a>
          <a className="nav-cta" href={LOGIN_URL}>
            Create your calendar
          </a>
        </nav>
      </header>

      <section className="hero">
        <h1>Scheduling, native to your stack.</h1>
        <p className="lede">
          Pick a time below — it books straight into Hanzo. Same engine,
          self-hosted, connected to the calendars you already use.
        </p>
      </section>

      <section className="booker-stage">
        <div className="booker-frame">
          <Booker
            host={HERO.host}
            eventSlug={HERO.eventSlug}
            apiUrl={calendarApi}
            onBooked={(booking) => {
              booked("hero", HERO);
              if (booking?.uid) navigate(`/booking/${booking.uid}`);
            }}
          />
        </div>
      </section>

      <section className="embed-hint">
        <p className="muted">Put this booker on your own page — two lines, no account:</p>
        <pre className="snippet">
          <code>{snippet}</code>
        </pre>
      </section>

      <section className="features">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="foot">
        <span>Hanzo Calendar</span>
        <span className="muted">Open source · api.hanzo.ai/v1/calendar</span>
      </footer>
    </main>
  );
}
