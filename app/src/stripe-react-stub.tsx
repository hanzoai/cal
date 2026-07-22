import type { ReactNode } from "react";

// Public booking is free — no Stripe payment UI is ever rendered — so these no-op
// stubs satisfy @calcom/atoms' optional @stripe/react-stripe-js imports (Elements,
// PaymentElement, useStripe, useElements) and keep the bundle self-contained. Paid
// events are out of Phase 1 scope.
export const Elements = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const PaymentElement = (): null => null;
export const useStripe = () => null;
export const useElements = () => null;
