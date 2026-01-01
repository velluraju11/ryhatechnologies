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

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";

import { getMetrics, isValidEmail, submitContactMessage, submitEarlyAccess } from "@/mock";

function Container({ children, className = "" }) {
  return <div className={`mx-auto w-full max-w-6xl px-4 md:px-6 ${className}`}>{children}</div>;
}

function Section({ eyebrow, title, subtitle, children, id }) {
  return (
    <section id={id} className="py-16 md:py-20">
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-3 inline-flex items-center gap-2">
              <span className="h-[1px] w-8 bg-white/15" />
              <span className="text-xs tracking-[0.18em] text-white/60 uppercase">{eyebrow}</span>
            </div>
          ) : null}
          {title ? <h2 className="ryha-h2">{title}</h2> : null}
          {subtitle ? <p className="mt-4 ryha-p">{subtitle}</p> : null}
        </div>
        <div className="mt-10">{children}</div>
      </Container>
    </section>
  );
}

function EarlyAccessCard({ compact = false, variant = "default" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [metrics, setMetrics] = useState(() => getMetrics());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMetrics(getMetrics());
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    setBusy(true);
    // a tiny delay makes it feel intentional (but still fast)
    await new Promise((r) => setTimeout(r, 450));
    const res = submitEarlyAccess({ name, email, interest });
    setBusy(false);

    if (!res.ok) {
      toast.error(res.error || "Something went wrong.");
      return;
    }

    setMetrics(res.metrics || getMetrics());

    if (res.already) {
      toast.message("You’re already on the list", {
        description: "We’ll only email when there’s something worth sharing.",
      });
    } else {
      toast.success("Early access confirmed", {
        description: "You’ll receive calm, high-signal updates. No noise.",
      });
    }

    setEmail("");
    setName("");
    setInterest("");
  };

  const cardTone =
    variant === "cta"
      ? "border-white/10 bg-white/[0.04]"
      : "border-white/10 bg-white/[0.03]";

  return (
    <Card className={`ryha-card ${cardTone}`}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <CardTitle className="text-white">Join the Early Access List</CardTitle>
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
            <Input
              value={interest}
              onChange={(e) => setInterest(e.target.value)}
              placeholder="What are you building? (optional)"
              className="ryha-input"
            />
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="submit" className="ryha-btn-primary" disabled={busy}>
              {busy ? "Submitting…" : "Join the Early Access List"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="text-xs text-white/55">
              <span className="text-white/80">{metrics.earlyAccessCount.toLocaleString()}</span> on the list ·
              <span className="ml-1">low-frequency updates</span>
            </div>
          </div>

          <div className="text-xs text-white/50">
            This form is <span className="text-white/70">FRONTEND-ONLY (MOCK)</span> for now.
            Your signup is stored locally in your browser.
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
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge className="ryha-badge" variant="outline">
                Stealth · Cybersecurity · AI
              </Badge>
              <Badge className="ryha-badge" variant="outline">
                Calm enterprise-grade design
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
                <Link to="/#early-access">
                  Join the Early Access List <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="ryha-btn-outline">
                <Link to="/mission">
                  Explore Our Mission <ChevronRight className="h-4 w-4" />
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
      <Hero />

      <Section
        eyebrow="Introduction"
        title="Quietly engineering a new generation of intelligent systems"
        subtitle="Ryha Technologies is engineering AI-driven systems designed to redefine cybersecurity, intelligence, and digital infrastructure."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="ryha-card border-white/10 bg-white/[0.03]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-white/80" />
                Protection
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
        title="Something powerful is being built."
        subtitle="A next-generation intelligence system is under development. Details are intentionally limited—until the architecture is ready to speak for itself."
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
                <CardTitle className="text-white">What you’ll get</CardTitle>
                <CardDescription className="text-white/65">
                  A controlled signal—no marketing noise.
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
                    Emails only when there’s something worth reading.
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
      <Section
        eyebrow="Mission"
        title="Systems that protect, adapt, and evolve"
        subtitle="Ryha Technologies exists to engineer intelligent systems that protect, adapt, and evolve alongside modern digital infrastructure."
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
                Principles that guide architecture before implementation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {["Intelligence over tools", "Systems over software", "Long-term impact over short-term gains", "Responsibility before capability"].map(
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
                We design for robustness, interpretability, and safe operating boundaries. We treat security as a system property—not a feature.
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-5">
            <Button asChild className="ryha-btn-primary w-full">
              <Link to="/#early-access">
                Join Early Access <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
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
            <div className="ryha-list-item"><span className="ryha-dot" />Intelligent system architecture</div>
            <div className="ryha-list-item"><span className="ryha-dot" />AI-driven decision intelligence</div>
            <div className="ryha-list-item"><span className="ryha-dot" />Secure-by-design foundations</div>
            <div className="ryha-list-item"><span className="ryha-dot" />Adaptive and evolving technology</div>
          </div>
        ),
      },
      {
        title: "Launch strategy",
        body: (
          <p className="text-white/70">
            The reveal will happen in stages. Early signals will precede public understanding.
          </p>
        ),
      },
      {
        title: "Beta access",
        body: (
          <p className="text-white/70">
            A limited number of subscribers may become eligible for private beta testing. Access is controlled and not guaranteed.
          </p>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Section
        eyebrow="Products"
        title="A new era of technology is being built."
        subtitle="Ryha Technologies is developing a next-generation intelligence platform designed to redefine how systems, security, and AI interact."
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">This is not an upgrade. This is a shift.</CardTitle>
                <CardDescription className="text-white/65">
                  Enough context to understand direction—without compromising the build.
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
          </div>

          <div className="md:col-span-5 grid gap-6">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Newsletter</CardTitle>
                <CardDescription className="text-white/65">Receive hints, progress signals, and early insights.</CardDescription>
              </CardHeader>
              <CardContent>
                <EarlyAccessCard compact variant="cta" />
              </CardContent>
            </Card>

            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Quiet by design</CardTitle>
                <CardDescription className="text-white/65">
                  We disclose details only when the system is ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Access, artifacts, and public information are governed by readiness—not timelines.
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
      <Section
        eyebrow="About"
        title="Cybersecurity and AI—built with restraint"
        subtitle="Ryha Technologies is a cybersecurity and AI-focused technology company working at the intersection of intelligence, security, and system automation."
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Contact"
        title="Serious collaborations only"
        subtitle="For serious inquiries and collaborations only. Product-specific technical details will not be disclosed via contact requests."
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
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    await new Promise((r) => setTimeout(r, 450));
    const res = submitContactMessage({ name, email, message });
    setBusy(false);

    if (!res.ok) {
      toast.error(res.error || "Unable to send.");
      return;
    }

    toast.success("Message saved", {
      description: "FRONTEND-ONLY (MOCK). We'll wire this to email/backend next.",
    });
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <>
      <Section
        eyebrow="Contact"
        title="Contact Ryha"
        subtitle="Email: contact@ryha.in"
      >
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Send a message</CardTitle>
                <CardDescription className="text-white/65">
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

                  <div className="text-xs text-white/50">
                    This form is <span className="text-white/70">FRONTEND-ONLY (MOCK)</span> for now.
                    Your message is stored locally in your browser.
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 grid gap-6">
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Notes</CardTitle>
                <CardDescription className="text-white/65">A simple boundary to keep focus.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-white/70">
                Ryha will respond to credible, high-context inquiries. Product details remain undisclosed.
              </CardContent>
            </Card>
            <Card className="ryha-card border-white/10 bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="text-white">Prefer email?</CardTitle>
                <CardDescription className="text-white/65">Write directly.</CardDescription>
              </CardHeader>
              <CardContent>
                <a
                  className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
                  href="mailto:contact@ryha.in"
                >
                  contact@ryha.in <ArrowRight className="h-4 w-4" />
                </a>
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
  return (
    <LegalShell title="Privacy Policy">
      <p>
        Ryha Technologies respects user privacy and protects personal data.
      </p>
      <ul>
        <li>Minimal data collection</li>
        <li>Secure handling and storage practices</li>
        <li>No selling of personal information</li>
        <li>Email is used only for communication and updates</li>
      </ul>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions">
      <p>
        By using this website, you agree to abide by website usage terms, intellectual property ownership rules, and limitation of liability.
      </p>
      <ul>
        <li>Content is owned by Ryha Technologies unless explicitly stated</li>
        <li>Use of this website is at your own risk</li>
        <li>Ryha Technologies is not liable for indirect damages</li>
        <li>Legal jurisdiction applies based on applicable law</li>
      </ul>
    </LegalShell>
  );
}

export function LegalDisclosurePage() {
  return (
    <LegalShell title="Legal Disclosure">
      <p>
        Ryha Technologies operates in stealth and provides limited public information.
      </p>
      <p>
        Any forward-looking statements on this website are informational and not commitments.
      </p>
    </LegalShell>
  );
}
