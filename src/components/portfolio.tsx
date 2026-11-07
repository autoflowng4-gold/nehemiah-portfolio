import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X, ArrowRight, Code2, Headphones, MonitorCog, Briefcase } from "lucide-react";
import {
  capabilities,
  contact,
  cvUrl,
  experience,
  experienceIntro,
  experienceSummary,
  navLinks,
  profile,
  projects,
  skillGroups,
  ventures,
} from "@/content/portfolio";
import { Button } from "@/components/ui/button";
import { TalkButton } from "@/components/chat";
import { ProjectMediaGallery } from "@/components/project-media";
import { usePortfolioAuth } from "@/components/auth-provider";
import { supabase } from "@/integrations/supabase/client";
import portrait from "@/assets/nehemiah-portrait.png.asset.json";

const icons = [Code2, Headphones, MonitorCog, Briefcase];

function OwnerVisitorBanner() {
  const { isOwner } = usePortfolioAuth();
  const visitors = useQuery({
    queryKey: ["site-visitor-count"],
    enabled: isOwner,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("site_visitor_count");
      if (error) throw error;
      return data as number;
    },
  });
  if (!isOwner) return null;
  return (
    <div className="flex h-9 items-center justify-center border-b bg-primary/10 px-5 text-xs text-primary">
      {visitors.isPending
        ? "Loading visitor count…"
        : visitors.error
          ? "Visitor count unavailable"
          : `${(visitors.data ?? 0).toLocaleString()} people have visited this website`}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { isOwner } = usePortfolioAuth();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/85 backdrop-blur">
      <OwnerVisitorBanner />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <a href="#home" className="font-display text-lg font-semibold tracking-[0.2em]">
          NEHEMIAH
        </a>
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex gap-6 text-sm text-muted-foreground">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Button asChild variant="outline" className="h-11">
              <Link to="/inbox">Inbox</Link>
            </Button>
          )}
          <TalkButton />
          <Button
            type="button"
            variant="outline"
            className="grid h-11 w-11 place-items-center rounded-md border lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      <MobileNavigation open={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}

function MobileNavigation({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  if (!open) return null;
  return (
    <nav id="mobile-nav" aria-label="Mobile" className="border-t bg-background lg:hidden">
      <ul className="mx-auto max-w-6xl px-5 py-3">
        {navLinks.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              onClick={onNavigate}
              className="block py-3 text-base text-muted-foreground hover:text-foreground"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
      <div className="relative mx-auto max-w-6xl px-5 fade-up">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {profile.positioning}
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-7xl">
          {profile.name}
          <span className="mt-4 block text-2xl leading-snug text-primary sm:text-3xl md:text-4xl">
            {profile.headline}
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{profile.intro}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <a
            href="#projects"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Explore My Work <ArrowRight size={18} />
          </a>
          <a
            href="#contact"
            className="inline-flex h-12 items-center justify-center rounded-md border px-6 font-semibold transition hover:bg-secondary"
          >
            Contact Me
          </a>
          <a
            href={cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-md border px-6 font-semibold transition hover:bg-secondary"
          >
            View CV
          </a>
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-muted-foreground">{children}</p>}
    </div>
  );
}

export function ProfileSection() {
  return (
    <section id="profile" className="border-t py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-[280px_1fr]">
        <img
          src={portrait.url}
          alt="Portrait of Nehemiah"
          width={768}
          height={768}
          className="mx-auto aspect-square w-60 object-contain md:w-72"
          loading="lazy"
        />
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-semibold">{profile.profileTagline}</h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{profile.profileSubtext}</p>
        </div>
      </div>
    </section>
  );
}

function Section({ id, children, alt }: { id: string; children: ReactNode; alt?: boolean }) {
  return (
    <section
      id={id}
      className={`border-t py-20 md:py-28 ${alt ? "bg-surface/70" : "bg-background/30"}`}
    >
      <div className="mx-auto max-w-6xl px-5">{children}</div>
    </section>
  );
}

function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-dashed px-2 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

export function About() {
  return (
    <Section id="about">
      <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <SectionHeading eyebrow="About" title={profile.aboutTitle} />
        <div className="space-y-5 text-lg text-muted-foreground">
          {profile.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CapabilityCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  const Icon = icons[index % icons.length] ?? Code2;
  return (
    <article className="group rounded-xl border bg-card p-6 transition hover:border-primary/60">
      <div className="mb-6 flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-secondary text-primary">
          <Icon size={22} />
        </span>
        <span className="font-display text-sm text-muted-foreground">0{index + 1}</span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </article>
  );
}

export function WhatIDo() {
  return (
    <Section id="what-i-do" alt>
      <SectionHeading eyebrow="Professional Capabilities" title="How I contribute to businesses." />
      <div className="grid gap-4 sm:grid-cols-2">
        {capabilities.map((c, i) => (
          <CapabilityCard key={c.title} {...c} index={i} />
        ))}
      </div>
    </Section>
  );
}

export function Skills() {
  return (
    <Section id="skills">
      <SectionHeading eyebrow="Skills" title="Toolkit">
        Current areas of focus; additional skills awaiting confirmation.
      </SectionHeading>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillGroups.map((g) => (
          <div key={g.category} className="rounded-xl border bg-card p-6">
            <h3 className="mb-4 font-semibold">{g.category}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li
                  key={s}
                  className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ProjectCard({ p }: { p: (typeof projects)[number] }) {
  return (
    <article className="rounded-2xl border bg-card p-6 md:p-10">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-2xl font-semibold md:text-3xl">{p.name}</h3>
        <span className="text-sm text-muted-foreground">{p.org}</span>
        <span className="rounded-full border border-primary/50 px-3 py-0.5 text-xs text-primary">
          {p.status}
        </span>
      </div>
      <p className="mt-4 max-w-3xl text-muted-foreground">{p.description}</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]">Implemented</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {p.implemented.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]">
            Planned direction
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {p.planned.map((x) => (
              <li key={x}>— {x}</li>
            ))}
          </ul>
        </div>
      </div>
      <ProjectMediaGallery projectName={p.name} />
    </article>
  );
}

export function Projects() {
  return (
    <Section id="projects" alt>
      <SectionHeading eyebrow="Selected Work" title="Projects & initiatives" />
      <div className="space-y-4">
        {projects.map((p) => (
          <ProjectCard key={p.name} p={p} />
        ))}
      </div>
    </Section>
  );
}

export function Experience() {
  return (
    <Section id="experience">
      <SectionHeading eyebrow="Experience" title="Professional journey">
        {experienceIntro}
      </SectionHeading>
      <p className="mb-10 max-w-3xl text-muted-foreground">{experienceSummary}</p>

      <div className="space-y-6">
        {experience.map((e, i) => (
          <article key={e.title} className="rounded-2xl border bg-card p-6 md:p-8">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-sm text-primary">
                0{i + 1}.
              </span>
              <h3 className="text-xl font-semibold md:text-2xl">{e.title}</h3>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{e.role}</span>
              <span aria-hidden="true">·</span>
              <span>{e.period}</span>
            </div>
            <p className="mt-4 text-muted-foreground">{e.description}</p>
            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              {e.responsibilities.map((r) => (
                <li key={r}>— {r}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-14">
        <h3 className="text-xl font-semibold md:text-2xl">
          Independent ventures &amp; technology projects
        </h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ventures.map((v) => (
            <article key={v.name} className="rounded-xl border bg-card p-6">
              <h4 className="text-lg font-semibold">{v.name}</h4>
              <p className="mt-1 text-sm text-primary">{v.role}</p>
              <p className="mt-3 text-sm text-muted-foreground">{v.description}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function WorkingApproach() {
  return (
    <Section id="working-approach" alt>
      <SectionHeading
        eyebrow="Working Approach"
        title="Understand the problem. Build the solution. Improve the experience."
      >
        Every project begins with understanding what needs to work better. From there, the focus
        is on developing practical solutions, paying attention to usability and making sure the
        technology serves a real purpose.
      </SectionHeading>
    </Section>
  );
}

export function ContactSection() {
  return (
    <Section id="contact" alt>
      <SectionHeading
        eyebrow="Contact"
        title="Have a project, opportunity or business challenge?"
      >
        Whether you are looking for digital support, website development, technical assistance or
        someone who can help improve your business operations, let's have a conversation.
      </SectionHeading>
      <p className="mb-6 text-lg font-medium">Let's discuss what you need.</p>
      <dl className="grid gap-4 sm:grid-cols-2">
        {contact.map((c) => {
          const href =
            c.label === "Email" && c.value
              ? `mailto:${c.value}`
              : c.label === "WhatsApp" && c.value
                ? `https://wa.me/${c.value.replace(/[^0-9]/g, "")}`
                : c.label === "Phone" && c.value
                  ? `tel:${c.value.replace(/[^0-9+]/g, "")}`
                  : c.label === "Twitter / X" && c.value
                    ? c.value
                    : null;
          const ctaLabel =
            c.label === "Email"
              ? "Send an Email"
              : c.label === "WhatsApp"
                ? "WhatsApp"
                : c.label === "Phone"
                  ? "Call"
                  : c.label === "Twitter / X"
                    ? "Twitter"
                    : c.label;
          return (
            <div key={c.label} className="rounded-xl border bg-card p-5">
              <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{ctaLabel}</dt>
              <dd className="mt-2 font-medium">
                {c.value ? (
                  href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      {c.value}
                    </a>
                  ) : (
                    c.value
                  )
                ) : (
                  <Placeholder>To be added</Placeholder>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="border-t py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p>
          <span className="font-semibold text-foreground">Nehemiah</span> — {profile.positioning}
        </p>
        <p>© {new Date().getFullYear()} Nehemiah</p>
      </div>
    </footer>
  );
}
