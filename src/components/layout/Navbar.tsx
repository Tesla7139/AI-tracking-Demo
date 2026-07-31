import { Container } from "@/components/primitives/Container";

export function Navbar({ onProductTour }: { onProductTour?: () => void }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-white/90 backdrop-blur-xl">
      <Container className="flex items-center justify-between gap-2 py-4">
        {/* Wordmark */}
        <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
          <span className="text-primary">CLICK</span>
          <span className="text-foreground">POST</span>
        </span>

        {/* Right: aligned nav actions, pushed to the right edge */}
        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <button
            type="button"
            onClick={onProductTour}
            className="whitespace-nowrap text-[13px] font-medium text-foreground/80 transition-colors hover:text-foreground sm:text-sm"
          >
            Product Tour
          </button>
          <a
            href="#"
            className="whitespace-nowrap rounded-full bg-primary px-3.5 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Book a free demo
          </a>
        </div>
      </Container>
    </header>
  );
}
