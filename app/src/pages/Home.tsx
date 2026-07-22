// The landing page. Public booking always happens at /{owner}/{slug}; this is just
// a friendly root.
export function Home() {
  return (
    <main className="shell">
      <div className="card">
        <h1>Book a time</h1>
        <p className="muted">
          Open a host's booking link — <code>cal.hanzo.ai/&#123;host&#125;/&#123;event&#125;</code>{" "}
          — to pick a time.
        </p>
      </div>
    </main>
  );
}
