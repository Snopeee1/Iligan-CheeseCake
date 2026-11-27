import { IntroMark } from "./Intro";
import { Dust } from "./motion";

/** Loading state between pages — the same gold ring + ICH monogram as the opening screen. */
export function RouteLoader({ label = "Because Life is so Cheesy!" }: { label?: string }) {
  return (
    <div className="glow-dark relative grid min-h-[80vh] place-items-center overflow-hidden" role="status" aria-live="polite">
      <Dust />
      <IntroMark tagline={label} loop />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
