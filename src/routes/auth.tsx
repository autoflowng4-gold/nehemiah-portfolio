import { createFileRoute, Link } from "@tanstack/react-router";
import { VisitorChat } from "@/components/chat";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Let's Talk — Nehemiah" },
      { name: "description", content: "Sign in to your private conversation with Nehemiah." },
      { property: "og:title", content: "Let's Talk — Nehemiah" },
      { property: "og:description", content: "A private conversation with Nehemiah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="relative z-10 mx-auto min-h-screen max-w-lg px-5 py-12">
      <Button asChild variant="ghost">
        <Link to="/">← Portfolio</Link>
      </Button>
      <h1 className="my-8 text-3xl">Let's Talk</h1>
      <VisitorChat />
    </main>
  ),
});
