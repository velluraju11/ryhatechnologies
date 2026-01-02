import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowRight, ExternalLink, Menu, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

const navLinkBase =
  "text-sm tracking-[0.01em] text-white/70 hover:text-white transition-colors";

function useScrollDepth() {
  const [depth, setDepth] = useState({ a: 0, b: 0 });

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setDepth({ a: Math.min(18, y * 0.04), b: Math.min(28, y * 0.065) });
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return depth;
}

function SiteBackdrop() {
  const depth = useScrollDepth();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#050607]" />

      {/* subtle grid */}
      <div className="absolute inset-0 ryha-grid opacity-[0.22]" />

      {/* calm glow layers (soft blue, extremely low saturation) */}
      <div
        className="absolute -top-40 left-[-20%] h-[560px] w-[560px] rounded-full ryha-glow"
        style={{ transform: `translate3d(0, ${-depth.a}px, 0)` }}
      />
      <div
        className="absolute -bottom-56 right-[-16%] h-[680px] w-[680px] rounded-full ryha-glow ryha-glow-2"
        style={{ transform: `translate3d(0, ${-depth.b}px, 0)` }}
      />

      {/* faint vignette */}
      <div className="absolute inset-0 ryha-vignette" />
    </div>
  );
}

function TopNav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled((window.scrollY || 0) > 8));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const nav = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/mission", label: "Mission" },
      { to: "/products", label: "Products" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/faq", label: "FAQ" },
    ],
    []
  );

  const isActive = (to) => location.pathname === to;

  return (
    <header
      className={
        "fixed top-0 left-0 right-0 z-50 border-b transition-colors " +
        (scrolled ? "border-white/10 bg-black/55" : "border-transparent bg-black/10")
      }
      style={{ backdropFilter: "blur(16px)" }}
    >
      <div className="w-full flex h-[76px] items-center justify-between pl-4 pr-4 md:pl-10 md:pr-8 lg:pl-12 lg:pr-12">
        <Link to="/" aria-label="Ryha Technologies Home" className="group flex items-center gap-3 -ml-3 md:-ml-6 lg:-ml-8">
          {/* Logo with Frame */}
          <span className="relative grid h-9 w-9 place-items-center rounded-lg border border-white/20 bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] transition-transform duration-300 group-hover:-translate-y-[1px]">
            <img
              src="/logo.webp"
              alt="Ryha Technologies"
              width="20"
              height="20"
              className="h-5 w-5 object-contain opacity-90"
            />
          </span>
          <span className="leading-none">
            <span className="block ryha-logo">Ryha</span>
            <span className="block text-[11px] tracking-[0.18em] text-white/55">
              TECHNOLOGIES
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive: active }) =>
                navLinkBase +
                " " +
                (active || isActive(item.to) ? "text-white" : "")
              }
            >
              {item.label}
            </NavLink>
          ))}

          <a
            href="https://blog.ryha.in"
            target="_blank"
            rel="noreferrer"
            aria-label="Ryha Technologies Blog"
            title="Read our latest updates on the Ryha Blog"
            className={navLinkBase + " inline-flex items-center gap-1.5"}
          >
            Blog <ExternalLink className="h-4 w-4" role="img" aria-label="External Link" alt="External Link" />
          </a>

          <Button asChild className="ryha-btn-primary">
            <Link to="/#early-access" aria-label="Join Early Access List" title="Join the Early Access List">
              Join Early Access <ArrowRight className="h-4 w-4" role="img" aria-label="Arrow Right" alt="Arrow Right" />
            </Link>
          </Button>
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="ryha-btn-outline" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-[#07080a] text-white border-white/10">
              <div className="flex flex-col gap-5 pt-6">
                <div>
                  <div className="text-sm font-semibold">Ryha Technologies</div>
                  <div className="text-xs text-white/60">Cybersecurity · AI · Stealth</div>
                </div>
                <Separator className="bg-white/10" />

                <div className="flex flex-col gap-3">
                  {nav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive: active }) =>
                        "text-base " + (active ? "text-white" : "text-white/75")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}

                  <a
                    href="https://blog.ryha.in"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Ryha Technologies Blog"
                    title="Read our latest updates on the Ryha Blog"
                    className="text-base text-white/75 inline-flex items-center gap-2"
                  >
                    Blog <ExternalLink className="h-4 w-4" role="img" aria-label="External Link" alt="External Link" />
                  </a>
                </div>

                <Separator className="bg-white/10" />

                <Button asChild className="ryha-btn-primary w-full">
                  <Link to="/#early-access" aria-label="Join Early Access List" title="Join the Early Access List">
                    Join Early Access <ArrowRight className="h-4 w-4" role="img" aria-label="Arrow Right" alt="Arrow Right" />
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-white/80">© {new Date().getFullYear()} Ryha Technologies</div>
            <div className="mt-1 text-xs text-white/55">
              Calm. Secure. Research-driven.
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link className="text-white/70 hover:text-white transition-colors" to="/privacy">
              Privacy Policy
            </Link>
            <Link className="text-white/70 hover:text-white transition-colors" to="/terms">
              Terms & Conditions
            </Link>
            <Link className="text-white/70 hover:text-white transition-colors" to="/legal">
              Legal Disclosure
            </Link>
            <Link className="text-white/70 hover:text-white transition-colors" to="/internships">
              Internship Program
            </Link>
            <Link className="text-white/70 hover:text-white transition-colors" to="/careers">
              Careers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen">
      <SiteBackdrop />
      <TopNav />

      <main className="pt-[96px]">
        {/* The centered container is inside each page (readability); not globally centering the entire app */}
        {children}
      </main>

      <Footer />

      <Toaster richColors={false} />
    </div>
  );
}
