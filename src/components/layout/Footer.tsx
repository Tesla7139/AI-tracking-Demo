import { Container } from "@/components/primitives/Container";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-white">
      <Container className="flex flex-col items-center justify-between gap-2 py-6 text-sm text-muted-foreground sm:flex-row">
        <p>Powered by {site.name}</p>
        <p>© 2026 {site.name}</p>
      </Container>
    </footer>
  );
}
