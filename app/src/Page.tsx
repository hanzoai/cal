import type { ReactNode } from "react";

// Every page cal.hanzo.ai serves at the top level: the mark, then one card.
// The card is the Booker's own (or the booking page's), never a second frame
// drawn around it.
export function Page({ children }: { children: ReactNode }) {
  return (
    <main className="page">
      <header className="nav">
        <a className="brand" href="https://hanzo.ai">
          <img className="brand-mark" src="/logo.svg" alt="" width={22} height={22} />
          Hanzo
        </a>
      </header>
      {children}
    </main>
  );
}
