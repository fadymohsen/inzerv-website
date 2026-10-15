import Link from "next/link";

/* ─── Inline SVG icons (simple line, rounded — brand spec) ─── */

function IconDocument() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="19" rx="2" />
      <path d="M19 7h4a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3" />
      <path d="M8 8h7M8 12h7M8 16h4" />
    </svg>
  );
}

function IconCar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13l2.5-6h13l2.5 6" />
      <rect x="2" y="13" width="24" height="8" rx="2" />
      <circle cx="7.5" cy="21" r="2.5" />
      <circle cx="20.5" cy="21" r="2.5" />
      <path d="M5 17h18" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="22" height="19" rx="2" />
      <path d="M3 13h22" />
      <path d="M10 13v12M18 13v12" />
      <rect x="11" y="18" width="6" height="7" rx="1" />
      <path d="M8 9V6M14 9V6M20 9V6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12L13 2z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a6 6 0 0 1 6-6h2" />
      <circle cx="18" cy="10" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M10 4l6 6-6 6" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10l5 5 7-8" />
    </svg>
  );
}

/* ─── Data ─────────────────────────────────────────────────── */

const services = [
  {
    icon: <IconDocument />,
    title: "Government Documents",
    description:
      "Extract and renew all official papers and formal documents with ease — fully handled from Egypt on your behalf.",
    tag: "Most Popular",
  },
  {
    icon: <IconCar />,
    title: "Limousine & Transportation",
    description:
      "Book premium rides and reliable transport. Schedule in advance and arrive on time, every time.",
    tag: null,
  },
  {
    icon: <IconBuilding />,
    title: "Real Estate",
    description:
      "Invest smarter and own faster. Discover the best opportunities with professional brokerage support.",
    tag: null,
  },
];

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your Inzerv account in minutes with a simple, guided registration.",
  },
  {
    number: "02",
    title: "Request Your Service",
    description: "Choose the service you need, fill in the details, and submit — step by step.",
  },
  {
    number: "03",
    title: "We Handle Everything",
    description: "Our team in Egypt takes care of all the logistics and official procedures for you.",
  },
  {
    number: "04",
    title: "Track & Receive",
    description: "Follow your request in real time and receive your results simply and reliably.",
  },
];

const values = [
  { icon: <IconShield />, label: "Trust" },
  { icon: <IconBolt />, label: "Speed" },
  { icon: <IconStar />, label: "Quality" },
  { icon: <IconUsers />, label: "Professionalism" },
  { icon: <IconTrend />, label: "Growth" },
];

/* ─── Page ──────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="bg-navy sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-turquoise text-navy font-semibold text-base leading-none select-none">
              iz
            </span>
            <span className="text-white font-semibold text-lg tracking-tight">Inzerv</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Services", "How It Works", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href="#services"
            className="hidden md:inline-flex items-center gap-2 bg-turquoise text-navy font-medium text-sm px-5 py-2.5 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
          >
            Get Started
            <IconArrow />
          </Link>

          {/* Mobile menu placeholder */}
          <button className="md:hidden text-white/70 hover:text-white transition-colors">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h16M3 12h16M3 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="bg-navy relative overflow-hidden">
          {/* Subtle bg accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-turquoise/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-turquoise/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-36 flex flex-col items-center text-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 border border-turquoise/30 text-turquoise text-xs font-medium px-4 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
              Government Documents MVP — Now Live
            </span>

            {/* Headline */}
            <h1 className="text-white font-semibold text-4xl lg:text-6xl leading-tight tracking-tight max-w-4xl">
              Your Egyptian Services,{" "}
              <span className="text-turquoise">Handled from Anywhere.</span>
            </h1>

            {/* Tagline */}
            <p className="mt-6 text-white/60 text-lg leading-relaxed max-w-2xl">
              Designed with{" "}
              <span className="text-turquoise font-medium">purpose</span>. Built on{" "}
              <span className="text-turquoise font-medium">trust</span>. Made for{" "}
              <span className="text-turquoise font-medium">you</span>.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="#services"
                className="inline-flex items-center gap-2 bg-turquoise text-navy font-medium text-base px-7 py-3.5 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
              >
                Start Your Service
                <IconArrow />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-medium text-base px-7 py-3.5 rounded-btn hover:border-white/40 hover:bg-white/5 transition-colors duration-150"
              >
                See How It Works
              </Link>
            </div>

            {/* Trust bar */}
            <div className="mt-16 flex flex-wrap justify-center gap-x-10 gap-y-4">
              {["Fully Secure", "Official Procedures", "Real-Time Tracking", "24/7 Support"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-white/50 text-sm">
                  <span className="text-turquoise"><IconCheck /></span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom divider wave */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-bg-light"
            style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
        </section>

        {/* ── Services ───────────────────────────────────────── */}
        <section id="services" className="bg-bg-light py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            {/* Section header */}
            <div className="text-center mb-14">
              <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-3">Our Services</p>
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl leading-snug">
                Everything You Need, In One Place
              </h2>
              <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
                From official government documents to premium transport and real estate — Inzerv covers it all.
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="relative bg-white rounded-card p-8 flex flex-col gap-5 border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {s.tag && (
                    <span className="absolute top-6 right-6 bg-turquoise/10 text-turquoise text-xs font-medium px-2.5 py-1 rounded-full">
                      {s.tag}
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                    {s.icon}
                  </div>
                  <div className="flex flex-col gap-2 flex-1">
                    <h3 className="text-navy font-semibold text-lg">{s.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{s.description}</p>
                  </div>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 text-turquoise text-sm font-medium hover:gap-3 transition-all duration-150"
                  >
                    Learn more <IconArrow />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────── */}
        <section id="how-it-works" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            <div className="text-center mb-14">
              <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-3">Process</p>
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl leading-snug">
                Simple Steps, Real Results
              </h2>
              <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
                We made it straightforward so you can focus on what matters — we handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="flex flex-col gap-4">
                  {/* Step number + connector */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-turquoise flex items-center justify-center text-navy font-semibold text-sm shrink-0">
                      {step.number}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden lg:block flex-1 h-px bg-turquoise/20" />
                    )}
                  </div>
                  <h3 className="text-navy font-semibold text-base">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ─────────────────────────────────────────── */}
        <section className="bg-navy py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            <p className="text-white/40 text-sm text-center uppercase tracking-widest mb-12">
              What We Stand For
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {values.map((v) => (
                <div key={v.label} className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-turquoise">
                    {v.icon}
                  </div>
                  <span className="text-white font-medium text-sm">{v.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────── */}
        <section className="bg-turquoise py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl leading-snug">
                Ready to Start Your Service?
              </h2>
              <p className="mt-3 text-navy/70 text-base max-w-xl leading-relaxed">
                Join thousands who trust Inzerv to handle their most important needs — from anywhere in the world.
              </p>
            </div>
            <Link
              href="#"
              className="shrink-0 inline-flex items-center gap-2 bg-navy text-white font-medium text-base px-8 py-4 rounded-btn hover:bg-navy-deep transition-colors duration-150"
            >
              Get Started Today
              <IconArrow />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-navy-deep">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-turquoise text-navy font-semibold text-sm select-none">
                iz
              </span>
              <span className="text-white font-semibold text-base">Inzerv</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6">
              {["Services", "About", "Privacy Policy", "Terms of Service", "Contact"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} Inzerv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
