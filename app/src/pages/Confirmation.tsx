import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { calendarApi } from "../api";

type Booking = {
  uid: string;
  title: string;
  status: string;
  startTime?: string;
  start?: string;
  location?: string;
  attendees?: { name?: string; email?: string }[];
};

// The booking confirmation / manage view for /booking/:uid. The uid is the booking's
// opaque capability, so Base reveals the real meeting location here (never before
// booking). Offers cancellation.
export function Confirmation() {
  const { uid = "" } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetch(`${calendarApi}/bookings/${encodeURIComponent(uid)}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success") setBooking(res.data);
        else setError(res.error?.message ?? "Booking not found");
      })
      .catch(() => setError("Booking not found"));
  }, [uid]);

  const cancel = () => {
    setCanceling(true);
    fetch(`${calendarApi}/bookings/${encodeURIComponent(uid)}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "" }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success") setBooking(res.data);
        else setError(res.error?.message ?? "Could not cancel");
      })
      .catch(() => setError("Could not cancel"))
      .finally(() => setCanceling(false));
  };

  if (error) {
    return (
      <main className="shell">
        <div className="card">
          <p className="muted">{error}</p>
        </div>
      </main>
    );
  }
  if (!booking) {
    return (
      <main className="shell">
        <div className="card">
          <p className="muted">Loading…</p>
        </div>
      </main>
    );
  }

  const canceled = booking.status === "cancelled";
  const when = new Date(booking.startTime ?? booking.start ?? "");
  const attendee = booking.attendees?.[0];

  return (
    <main className="shell">
      <div className="card">
        <div className={`badge ${canceled ? "badge-off" : "badge-on"}`}>
          {canceled ? "Canceled" : "Confirmed"}
        </div>
        <h1>{booking.title}</h1>
        <p className="when">
          {when.toLocaleString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
        {booking.location ? <p className="loc">{booking.location}</p> : null}
        {attendee ? (
          <p className="muted">
            {attendee.name}
            {attendee.email ? ` · ${attendee.email}` : ""}
          </p>
        ) : null}
        {!canceled ? (
          <button className="cancel" onClick={cancel} disabled={canceling}>
            {canceling ? "Canceling…" : "Cancel booking"}
          </button>
        ) : null}
      </div>
    </main>
  );
}
