import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { isValidEmail } from "@/mock"; // Keep helper, remove mock submitters
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import SEO from "@/components/SEO";
// Line 1-20: import React... import { Link }... icons... badge... button... card... input... textarea... accordion... separator... import { getMetrics... } from "@/mock".
// I don't see "import { toast } from 'sonner'". It might be missing in original file or auto-imported? The snippet shows "toast.error" on line 73.
// If it was working before, it must have been there. Wait, I viewed lines 1-800.
// Let me double check if I missed it.
// Code snippet lines 1-20 don't show it. Maybe strictly inside lines 20-30?
// Line 20 was the last line of import block usually.
// I will add `import { toast } from "sonner";` to be safe.

function Container({ children, className = "", full = false }) {
  return (
    <div
      className={
        full
          ? `w-full pl-6 pr-4 md:pl-16 md:pr-8 lg:pl-24 lg:pr-12 ${className}`
          : `mx-auto w-full max-w-6xl px-4 md:px-6 ${className}`
      }
    >
      {children}
    </div>
  );
}

function Section({ eyebrow, title, subtitle, children, id, maxWidth = "max-w-3xl", full = false, titleAs = "h2" }) {
  const TitleTag = titleAs;
  return (
    <section id={id} className="py-16 md:py-20">
      <Container full={full}>
        <div className={maxWidth}>
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-[1px] w-8 bg-white/15" />
              <span className="text-xs tracking-[0.18em] text-white/60 uppercase">{eyebrow}</span>
            </div>
          )}
          {title && <TitleTag className={titleAs === "h1" ? "ryha-h1" : "ryha-h2"}>{title}</TitleTag>}
          {subtitle && (
            <p className={`mt-4 ryha-p ${full ? "ryha-p-full" : ""}`}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

function EarlyAccessCard({ compact = false, variant = "default" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [busy, setBusy] = useState(false);

  const isValidPhone = (p) => {
    // 1. Must check for country code (starts with +) and at least 10 digits total
    // Regex matches: optional +, then 1 or more digits, then space/dash/dot possible, then more digits.
    // Total digit count check is better done on cleaned string.

    const clean = p.replace(/\D/g, '');
    const isMoreThanTen = clean.length >= 10;
    const hasCountryCode = p.trim().startsWith('+'); // User requirement: "must check for valid number country code"

    // User: "no duplicate number like ten 0s"
    const isRepeated = /^(\d)\1+$/.test(clean);

    return isMoreThanTen && !isRepeated && hasCountryCode;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (phone) {
      if (!isValidPhone(phone)) {
        toast.error("Invalid phone number", {
          description: "Please enter a valid phone number with country code (e.g. +91...)"
        });
        return;
      }
    }

    // Blacklist check
    const BLACKLIST = ["narmatha", "narmadha", "narmada", "narmata"];
    const inputs = [name, email, phone, interest].filter(Boolean);
    const hasBlacklisted = inputs.some(val =>
      BLACKLIST.some(bad => val.toLowerCase().includes(bad))
    );

    if (hasBlacklisted) {
      toast("This name can not be used", {
        description: "No entry for this name",
        icon: "🚫",
      });
      return;
    }

    setBusy(true);

    // Check if email already exists
    const { data: existing } = await supabase
      .from("early_access_signups")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      setBusy(false);
      toast("Already in waitlist", {
        description: "You are already on the list. We'll be in touch.",
      });
      return;
    }

    const { error } = await supabase
      .from("early_access_signups")
      .insert([{ name, email, phone, interest }]);

    setBusy(false);

    if (error) {
      // Check for unique violation (Postgres error 23505)
      if (error.code === '23505') {
        toast("Already in waitlist", {
          description: "You are already on the list. We'll be in touch.",
          icon: "✅", // Using check or similar positive indicator as they are already on list
        });
        return;
      }
      toast.error("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Early access confirmed", {
      description: "You’ll receive calm, high-signal updates. No noise.",
    });

    setEmail("");
    setName("");
    setPhone("");
    setInterest("");
  };

  const cardTone =
    variant === "cta"
      ? "border-white/10 bg-white/[0.04]"
      : "border-white/10 bg-white/[0.03]";

  return (
    <Card className={`ryha-card ${cardTone}`}>
      <CardHeader className={compact ? "pb-3" : ""}>
        {compact ? (
          <div className="text-lg font-semibold leading-none tracking-tight text-white">Join the Early Access List</div>
        ) : (
          <CardTitle className="text-white">Join the Early Access List</CardTitle>
        )}
        <CardDescription className="text-white/65">
          AI-driven cybersecurity and intelligent system protection.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-3">
          {!compact ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name (optional)"
                className="ryha-input"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="ryha-input"
                inputMode="email"
              />
            </div>
          ) : (
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="ryha-input"
              inputMode="email"
            />
          )}

          {!compact ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone (optional, with country code)"
                className="ryha-input"
                inputMode="tel"
              />
              <Input
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                placeholder="Any message to Ryha ? ( Optional )"
                className="ryha-input"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="ryha-btn-primary" disabled={busy}>
              {busy ? "Submitting…" : "Join the Early Access List"}
              <ArrowRight className="h-4 w-4" />
            </Button>

          </div>

          <div className="text-xs text-white/50">
            Securely encrypted and stored.
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Hero() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setTilt({ x: px * 3.2, y: -py * 3.2 });
      });
    };

    const onLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="pt-10 pb-14 md:pt-14 md:pb-18">
      <Container full>
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="ryha-badge" variant="outline">
                Stealth · Cybersecurity · AI
              </Badge>
              <Badge className="ryha-badge" variant="outline">
                Calm, enterprise-grade design
              </Badge>
            </div>

            <h1 className="ryha-h1">
              Securing Digital Systems Today.
              <br />
              Building the Intelligence of Tomorrow.
            </h1>
            <p className="mt-6 ryha-lead">
              AI-driven cybersecurity and intelligent system protection.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild className="ryha-btn-primary">
                <Link to="/#early-access" aria-label="Join the Early Access List" title="Join the Early Access List">
                  Join the Early Access List <ArrowRight className="h-4 w-4" role="img" aria-label="Arrow Right" alt="Arrow Right" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="ryha-btn-outline">
                <Link to="/mission" aria-label="Explore Our Mission" title="Explore Our Mission and Vision">
                  Explore Our Mission <ChevronRight className="h-4 w-4" role="img" aria-label="View Mission" alt="View Mission" />
                </Link>
              </Button>
            </div>

            <div className="mt-6 text-xs text-white/55">
              No hype. No theatrics. Just careful engineering.
            </div>
          </div>

          <div className="md:col-span-5">
            <div
              ref={ref}
              className="ryha-depth-card"
              style={{ transform: `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
            >
              <div className="ryha-depth-card-inner">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/75">Stealth Build</div>
                    <div className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white">
                      Intelligence Platform
                    </div>
                    <div className="mt-2 text-sm text-white/60">
                      A long-horizon system designed to protect, adapt, and evolve.
                    </div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <Sparkles className="h-5 w-5 text-white/85" />
                  </div>
                </div>

                <Separator className="my-6 bg-white/10" />

                <div className="grid gap-3">
                  {["AI-first architecture", "Security by design", "Research-driven development", "Ethics-led innovation"].map(
                    (t) => (
                      <div key={t} className="flex items-center gap-3 text-sm">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 border border-white/10">
                          <Check className="h-4 w-4 text-white/85" />
                        </span>
                        <span className="text-white/75">{t}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs tracking-[0.16em] uppercase text-white/55">Signal</div>
                  <div className="mt-2 text-sm text-white/70">
                    “Something powerful is being built.”
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <SEO title="AI-Driven Cybersecurity" description="Ryha Technologies is engineering AI-driven systems designed to redefine cybersecurity, intelligence, and digital infrastructure." />
      <Hero />

      <Section
        eyebrow="Introduction"
        title="Quietly engineering AI-Driven Intelligent Security Systems"
        subtitle="Ryha Technologies is engineering AI-driven systems designed to redefine cybersecurity, intelligence, and digital infrastructure."
        full
        maxWidth="max-w-none"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white/80" />
                Autonomous Threat Protection
              </CardTitle>
              <CardDescription className="text-white/65">
                Security foundations that are designed in—before capabilities.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5 text-white/80" />
                Stealth
              </CardTitle>
              <CardDescription className="text-white/65">
                Some systems require focus, patience, and restraint.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-white/80" />
                Ethics
              </CardTitle>
              <CardDescription className="text-white/65">
                Responsibility before capability—always.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Teaser"
        title="Autonomous Cybersecurity Infrastructure is being built."
        subtitle="A next-generation intelligence system is under development. Details are intentionally limited—until the architecture is ready to speak for itself."
        full
        maxWidth="max-w-none"
      >
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">What we can say</CardTitle>
                <CardDescription className="text-white/65">
                  High-level only. Enough to understand intent—without compromising focus.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                <ul className="grid gap-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--ryha-accent)]/70" />
                    A platform built around intelligent decision systems.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--ryha-accent)]/70" />
                    Security and resilience as foundational constraints.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--ryha-accent)]/70" />
                    Research-driven development, with long-term outcomes.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5">
            <EarlyAccessCard compact variant="cta" />
          </div>
        </div>
      </Section>

      <Section
        id="early-access"
        eyebrow="Newsletter"
        title="Early access and updates"
        subtitle="If you want to be present for the reveal—subscribe for high-signal updates."
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <EarlyAccessCard variant="cta" />
          </div>
          <div className="md:col-span-5">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">What you get with Ryha AI Security</CardTitle>
                <CardDescription className="text-white/65">
                  No marketing noise. No constant messaging. Only controlled communication.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                <div className="grid gap-3">
                  {["Progress signals and milestones", "Hints about core architecture", "Early access eligibility updates"].map(
                    (t) => (
                      <div key={t} className="flex items-center gap-3">
                        <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 border border-white/10">
                          <Check className="h-4 w-4 text-white/85" />
                        </span>
                        <span>{t}</span>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-xs tracking-[0.16em] uppercase text-white/55">Promise</div>
                  <div className="mt-2 text-sm text-white/70">
                    A controlled signal — not a broadcast. Calm. Secure. Research-driven.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

export function MissionPage() {
  return (
    <>
      <SEO title="Mission" description="Ryha Technologies exists to engineer intelligent systems that protect, adapt, and evolve alongside modern digital infrastructure." />
      <Section
        eyebrow="Mission"
        title="Systems that protect, adapt, and evolve"
        subtitle="Ryha Technologies exists to engineer intelligent systems that protect, adapt, and evolve alongside modern digital infrastructure."
        full
        maxWidth="max-w-none"
        titleAs="h1"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Vision</CardTitle>
              <CardDescription className="text-white/65">
                To create AI-driven systems that fundamentally change how security, intelligence, and automation operate.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Long-Term Goal</CardTitle>
              <CardDescription className="text-white/65">
                Building for the next era of technology—not the next product cycle.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white">Philosophy</CardTitle>
              <CardDescription className="text-white/65">
                Principles that guide architecture before implementation. These principles inform how systems are designed, constrained, and evolved — long before interfaces or capabilities are exposed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Intelligence over tools",
                  "Systems over software",
                  "Long-term impact over short-term gains",
                  "Responsibility before capability",
                ].map((t) => (
                  <div key={t} className="ryha-list-item">
                    <span className="ryha-dot" />
                    <span className="text-white/75">{t}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section
        eyebrow="Signal"
        title="Steady execution"
        subtitle="A mission is only credible when it’s built with restraint."
      >
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-7">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardContent className="pt-6 text-sm text-white/70">
                <div className="grid gap-3">
                  <div className="ryha-list-item"><span className="ryha-dot" />Deliberate, measured execution — long-horizon focus over short-term speed.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Robustness and interpretability as design priorities for safe operation.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Security designed as a system property, not an afterthought.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Constraints defined early to shape correct long-term behavior.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Auditability and explainability baked into models and decision flows.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Continuous validation and adversarial testing to maintain robustness.</div>
                  <div className="ryha-list-item"><span className="ryha-dot" />Privacy-preserving defaults and minimal data exposure by design.</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-5">
            <div>
              <div className="text-white/85 text-lg font-semibold">Join Early Access</div>
              <div className="mt-2 text-white/65">
                If you want to follow the progress of systems built with care, discipline, and long-term intent, you can join the early access list.
              </div>

              <div className="mt-4 grid gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 border border-white/10">
                    <Check className="h-4 w-4 text-white/85" />
                  </span>
                  <span className="text-white/75">High-signal updates only</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 border border-white/10">
                    <Check className="h-4 w-4 text-white/85" />
                  </span>
                  <span className="text-white/75">Progress milestones when they matter</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-white/5 border border-white/10">
                    <Check className="h-4 w-4 text-white/85" />
                  </span>
                  <span className="text-white/75">Limited early access opportunities when available</span>
                </div>
              </div>

              <div className="mt-6">
                <Button asChild className="ryha-btn-primary w-full">
                  <Link to="/#early-access">Join Early Access <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

export function ProductsPage() {
  const items = useMemo(
    () => [
      {
        title: "What we can share (high-level only)",
        body: (
          <div className="grid gap-3 text-white/70">
            <div className="ryha-list-item"><span className="ryha-dot" />A platform built around intelligent decision systems</div>
            <div className="ryha-list-item"><span className="ryha-dot" />Security and resilience treated as foundational constraints</div>
            <div className="ryha-list-item"><span className="ryha-dot" />AI-first architecture designed for long-horizon operation</div>
            <div className="ryha-list-item"><span className="ryha-dot" />Research-driven development focused on correctness and durability</div>
            <div className="ryha-list-item"><span className="ryha-dot" />No features are announced prematurely; no demonstrations are released before they are representative.</div>
          </div>
        ),
      },
      {
        title: "Launch strategy",
        body: (
          <div className="text-white/70">
            <p>The reveal will happen in stages.</p>
            <p>Progress is not communicated by timelines or marketing cycles, but by system readiness. Signals will precede public understanding; artifacts will precede explanations. This approach is deliberate.</p>
          </div>
        ),
      },
      {
        title: "Beta access",
        body: (
          <div className="text-white/70">
            <p>Controlled access. Limited beta.</p>
            <p>A small group of early subscribers may become eligible for private beta testing. Selection is based on relevance, merit, and alignment with the system’s direction. There are no guarantees — only fit.</p>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <SEO title="Products" description="Ryha Technologies is developing a next-generation intelligence platform designed to redefine how systems, security, and AI interact." />
      <Section
        eyebrow="Products"
        title="A Powerful AI-Native Operating System is being built."
        subtitle={
          "Ryha Technologies is developing a next-generation intelligence platform designed to redefine how systems, security, and AI interact. Our focus is not on incremental improvements, but on foundational change in how intelligent systems are designed, constrained, and deployed. This is not an upgrade. This is a shift."
        }
        maxWidth="max-w-none"
        full
        titleAs="h1"
      >


        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7 space-y-6">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">This is not an upgrade. This is a shift.</CardTitle>
                <CardDescription className="text-white/65">
                  Enough context to understand direction — without compromising the build. What is being developed at Ryha is intentionally disclosed in stages. Clarity follows readiness; public detail follows architectural maturity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="ryha-accordion">
                  {items.map((it, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border-white/10">
                      <AccordionTrigger className="text-white/80 hover:no-underline">
                        {it.title}
                      </AccordionTrigger>
                      <AccordionContent>{it.body}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Quiet by Design — Restraint and Readiness</CardTitle>
                <CardDescription className="text-white/65">
                  We disclose details only when the system is ready. Restraint is discipline, not absence.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Access, artifacts, and public information are governed by readiness — not urgency. Restraint enables focus and helps ensure systems are representative before public release.
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 grid gap-6">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Newsletter: Early Access & Signals</CardTitle>
                <CardDescription className="text-white/65">Receive hints, progress signals, and early insights.</CardDescription>
              </CardHeader>
              <CardContent>
                <EarlyAccessCard compact variant="cta" />
                <div className="mt-4 text-sm text-white/70">
                  We are focused on platform-level change: foundational architecture, safety, and long-term durability. Details are shared in stages—clarity follows readiness.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Next step"
        title="Be present for the reveal"
        subtitle="Subscribe now to receive high-signal updates—then wait for the first real proof."
      >
        <div className="ryha-cta">
          <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="text-white/85 text-lg font-semibold">Join early access</div>
              <div className="mt-2 text-white/65">
                Controlled access. Limited beta. No guarantees—only merit and fit.
              </div>
            </div>
            <div className="md:col-span-5">
              <EarlyAccessCard compact variant="cta" />
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

export function AboutPage() {
  return (
    <>
      <SEO title="About" description="Ryha Technologies is a cybersecurity and AI-focused company working at the intersection of intelligence, security, and system automation." />
      <Section
        eyebrow="About"
        title="Cybersecurity and AI—built with restraint"
        subtitle="Ryha Technologies is a cybersecurity and AI-focused company working at the intersection of intelligence, security, and system automation."
        full
        maxWidth="max-w-none"
        titleAs="h1"
      >
        <div className="grid gap-5 md:grid-cols-12">
          <div className="md:col-span-7 grid gap-5">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Approach</CardTitle>
                <CardDescription className="text-white/65">
                  Research-first mindset. Architecture before features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {["Research-first mindset", "Architecture before features", "Quiet development before public reveal"].map(
                    (t) => (
                      <div key={t} className="ryha-list-item">
                        <span className="ryha-dot" />
                        <span className="text-white/75">{t}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Operating in stealth</CardTitle>
                <CardDescription className="text-white/65">
                  Some technologies require focus, patience, and restraint.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Ryha reveals innovation only when it is ready.
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Principles</CardTitle>
                <CardDescription className="text-white/65">
                  Calm systems with real-world consequences.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <ShieldCheck className="h-4 w-4 text-white/85" />
                    </span>
                    <div>
                      <div className="text-white/80 font-medium">Trust</div>
                      <div className="text-white/65">Designed for durability and clarity.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Scale className="h-4 w-4 text-white/85" />
                    </span>
                    <div>
                      <div className="text-white/80 font-medium">Responsibility</div>
                      <div className="text-white/65">Safety before scale.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Lock className="h-4 w-4 text-white/85" />
                    </span>
                    <div>
                      <div className="text-white/80 font-medium">Stealth</div>
                      <div className="text-white/65">Quiet execution until readiness.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Sparkles className="h-4 w-4 text-white/85" />
                    </span>
                    <div>
                      <div className="text-white/80 font-medium">Explainability</div>
                      <div className="text-white/65">Transparent, auditable decisions and clear rationale.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5">
                      <Check className="h-4 w-4 text-white/85" />
                    </span>
                    <div>
                      <div className="text-white/80 font-medium">Resilience</div>
                      <div className="text-white/65">Built for reliability under adversarial conditions.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Contact"
        title="Serious collaborations only"
        subtitle="For serious, high-context inquiries and collaborations only. Product-specific technical details are not shared via general contact requests."
        full
        maxWidth="max-w-none"
      >
        <Button asChild className="ryha-btn-primary">
          <Link to="/contact">
            Contact Ryha <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Section>
    </>
  );
}

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState({
    email: "contact@ryha.in",
    location_header: "Tirunelveli, Tamilnadu, India - 627006",
    notes_title: "Notes",
    notes_description: "A simple boundary to keep focus.",
    notes_content: "Ryha will respond to credible, high-context inquiries. Product details remain undisclosed.",
    location_card_title: "Location & Links",
    location_card_description: "Tirunelveli, Tamil Nadu, India — 627006",
    linkedin: "https://www.linkedin.com/company/ryha-technologies/",
    instagram: "https://www.instagram.com/ryha_technologies/",
    twitter: "https://x.com/Ryha_Tech"
  });

  useEffect(() => {
    supabase.from("site_content").select("content").eq("key", "contact_info").single()
      .then(({ data }) => {
        if (data?.content) {
          try {
            const parsed = JSON.parse(data.content);
            setInfo(prev => ({ ...prev, ...parsed }));
          } catch (e) { }
        }
      });
  }, []);

  const isValidPhone = (p) => {
    const clean = p.replace(/\D/g, '');
    const isMoreThanTen = clean.length >= 10;
    const hasCountryCode = p.trim().startsWith('+');
    const isRepeated = /^(\d)\1+$/.test(clean);
    return isMoreThanTen && !isRepeated && hasCountryCode;
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!isValidPhone(phone)) {
      toast.error("Invalid phone number", {
        description: "Please enter a valid phone number with country code (e.g. +91...)"
      });
      return;
    }

    // Blacklist check
    const BLACKLIST = ["narmatha", "narmadha", "narmada", "narmata"];
    const inputs = [name, email, phone, message].filter(Boolean);
    const hasBlacklisted = inputs.some(val =>
      BLACKLIST.some(bad => val.toLowerCase().includes(bad))
    );

    if (hasBlacklisted) {
      toast("This name can not be used", {
        description: "No entry for this name",
        icon: "🚫",
      });
      return;
    }

    setBusy(true);

    const { error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, phone, message }]);

    setBusy(false);

    if (error) {
      toast.error("Unable to send. Please try again.");
      console.error(error);
      return;
    }

    toast.success("Message sent", {
      description: "We have received your inquiries.",
    });
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  const subtitle = `Email: ${info.email}          Location : ${info.location_header}`;

  return (
    <>
      <SEO title="Contact" description="Contact Ryha Technologies for serious inquiries and collaborations. Product details remain undisclosed via general contact." />
      <Section
        eyebrow="Contact"
        title="Contact Ryha"
        subtitle={subtitle}
        titleAs="h1"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Send a message</CardTitle>
                <CardDescription className="text-white/65 ryha-wide">
                  Serious inquiries and collaborations only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className="ryha-input"
                      required
                    />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="ryha-input"
                      inputMode="email"
                      required
                    />
                  </div>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="ryha-input"
                    inputMode="tel"
                    required
                  />
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message"
                    className="ryha-input min-h-[140px]"
                    required
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button className="ryha-btn-primary" disabled={busy} type="submit">
                      {busy ? "Sending…" : "Send Message"}
                      <Mail className="h-4 w-4" />
                    </Button>
                    <div className="text-xs text-white/55">
                      Product technical details won’t be shared via contact.
                    </div>
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 grid gap-6">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">{info.notes_title}</CardTitle>
                <CardDescription className="text-white/65">{info.notes_description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                {info.notes_content}
              </CardContent>
            </Card>
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">{info.location_card_title}</CardTitle>
                <CardDescription className="text-white/65">{info.location_card_description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 text-sm">
                  {info.linkedin && (
                    <a
                      className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                      href={info.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      💼 LinkedIn (Company Page)
                    </a>
                  )}
                  {info.instagram && (
                    <a
                      className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                      href={info.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📸 Instagram
                    </a>
                  )}
                  {info.twitter && (
                    <a
                      className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                      href={info.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ✖ X (Twitter)
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}

function LegalShell({ title, children }) {
  return (
    <Section eyebrow="Legal" title={title} subtitle="Ryha Technologies — website policies">
      <Card className="ryha-card border-white/10 bg-white/[0.03]">
        <CardContent className="pt-6 prose prose-invert max-w-none">
          {children}
        </CardContent>
      </Card>
    </Section>
  );
}

export function PrivacyPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    supabase.from("site_content").select("content").eq("key", "privacy_policy").single()
      .then(({ data }) => setContent(data?.content || "Privacy Policy not yet configured."));
  }, []);

  return (
    <LegalShell title="Privacy Policy">
      <SEO title="Privacy Policy" />
      {content === null ? <p>Loading policy...</p> : <div className="font-sans text-white/80 ryha-legal-content" dangerouslySetInnerHTML={{ __html: content }} />}
    </LegalShell>
  );
}

export function TermsPage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    supabase.from("site_content").select("content").eq("key", "terms").single()
      .then(({ data }) => setContent(data?.content || "Terms not yet configured."));
  }, []);

  return (
    <LegalShell title="Terms & Conditions">
      <SEO title="Terms & Conditions" />
      {content === null ? <p>Loading terms...</p> : <div className="font-sans text-white/80 ryha-legal-content" dangerouslySetInnerHTML={{ __html: content }} />}
    </LegalShell>
  );
}

export function LegalDisclosurePage() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    supabase.from("site_content").select("content").eq("key", "legal").single()
      .then(({ data }) => setContent(data?.content || "Legal Disclosure not yet configured."));
  }, []);

  return (
    <LegalShell title="Legal Disclosure">
      <SEO title="Legal Disclosure" />
      {content === null ? <p>Loading disclosure...</p> : <div className="font-sans text-white/80 ryha-legal-content" dangerouslySetInnerHTML={{ __html: content }} />}
    </LegalShell>
  );
}
