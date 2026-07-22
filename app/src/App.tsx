import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Booking } from "./pages/Booking";
import { Confirmation } from "./pages/Confirmation";
import { Home } from "./pages/Home";

// Routes:
//   /                      landing
//   /booking/:uid          booking confirmation / manage (more specific — matched first)
//   /:owner/:slug          the public Booker for one event type
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking/:uid" element={<Confirmation />} />
        <Route path="/:owner/:slug" element={<Booking />} />
      </Routes>
    </BrowserRouter>
  );
}
