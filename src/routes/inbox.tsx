import { createFileRoute } from "@tanstack/react-router";
import { OwnerInbox } from "@/components/chat";
export const Route = createFileRoute("/inbox")({
  head: () => ({
    meta: [
      { title: "Private inbox — Nehemiah" },
      { name: "description", content: "Nehemiah's private visitor conversation inbox." },
      { property: "og:title", content: "Private inbox — Nehemiah" },
      { property: "og:description", content: "Private visitor conversations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OwnerInbox,
});
