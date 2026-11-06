import { createFileRoute } from "@tanstack/react-router";
import {
  About,
  ContactSection,
  Experience,
  Footer,
  Header,
  Hero,
  ProfileSection,
  Projects,
  Skills,
  WhatIDo,
  WorkingApproach,
} from "@/components/portfolio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nehemiah — Technology, Digital Operations & Customer Support" },
      {
        name: "description",
        content:
          "Portfolio of Nehemiah: web development, customer support, website management and digital operations.",
      },
      { property: "og:title", content: "Nehemiah — Portfolio" },
      {
        property: "og:description",
        content: "Web development, customer support and digital operations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        <Hero />
        <ProfileSection />
        <About />
        <WhatIDo />
        <Skills />
        <Projects />
        <Experience />
        <WorkingApproach />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
