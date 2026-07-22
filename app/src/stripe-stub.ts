// Public booking is free — no payments — so the Stripe SDK is never loaded. This
// stub satisfies @calcom/atoms' optional `@stripe/stripe-js` import at build time
// and keeps the bundle self-contained (no external SDK, CSP-clean). Paid events are
// out of Phase 1 scope; wiring real Stripe is a later, deliberate step.
export const loadStripe = () => Promise.resolve(null);
export default { loadStripe };
