// Hanzo Calendar — the marketing landing at cal.hanzo.ai/. Public booking pages
// live at /{host}/{event}; the hero embeds a live, bookable demo.
import { CalendarEmbed } from "@hanzo/booker";

import { calendarApi } from "../api";

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

export function Home() {
  return (
    <main className="landing">
      <header className="nav">
        <span className="brand">Hanzo Calendar</span>
        <a className="nav-cta" href="/hanzo/intro">
          Book a time
        </a>
      </header>

      <section className="hero">
        <h1>Scheduling, the way it should be.</h1>
        <p className="lede">
          Share a link, pick a time, done. Hanzo Calendar is native scheduling
          on your own infrastructure — connected to the calendars you already
          use.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="/hanzo/intro">
            Try a booking →
          </a>
          <a
            className="btn btn-ghost"
            href="https://github.com/hanzoai/cal"
            target="_blank"
            rel="noreferrer"
          >
            View the source
          </a>
        </div>
        <p className="hero-note">
          Live at <code>cal.hanzo.ai/&#123;host&#125;/&#123;event&#125;</code>
        </p>
      </section>

      <section className="hero-demo">
        <div className="demo-card">
          <CalendarEmbed host="hanzo" eventSlug="intro" apiUrl={calendarApi} />
        </div>
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
