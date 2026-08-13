import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Booking } from "./pages/Booking";
import { Confirmation } from "./pages/Confirmation";
import { Embed } from "./pages/Embed";
import { Home } from "./pages/Home";

// Routes:
//   /                      landing
//   /embed?pk=             the framed Booker a host page embeds
//   /booking/:uid          booking confirmation / manage (more specific — matched first)
//   /:owner/:slug          the public Booker for one event type
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/embed" element={<Embed />} />
        <Route path="/booking/:uid" element={<Confirmation />} />
        <Route path="/:owner/:slug" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}
