import { createFileRoute, Link } from "@tanstack/react-router";
import { AccountForm } from "@/components/account-form";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Nehemiah" },
      { name: "description", content: "Securely reset your Nehemiah portfolio account password." },
      { property: "og:title", content: "Reset password — Nehemiah" },
      { property: "og:description", content: "Secure account recovery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <main className="relative z-10 mx-auto min-h-screen max-w-lg px-5 py-12">
      <Link to="/auth" className="text-primary">
        ← Let's Talk
      </Link>
      <h1 className="my-8 text-3xl">Reset password</h1>
      <AccountForm reset />
    </main>
  ),
});
