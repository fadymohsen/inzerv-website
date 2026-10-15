import Image from "next/image";
import Link from "next/link";

/* ─── Inline SVG Icons ─────────────────────────────────────── */

function IconDocument() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h10l6 6v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <polyline points="16 3 16 9 22 9" />
      <path d="M9 13h10M9 17h6" />
    </svg>
  );
}

function IconCar() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14l2.5-6h13l2.5 6" />
      <rect x="2" y="14" width="24" height="7" rx="2" />
      <circle cx="7.5" cy="21" r="2" />
      <circle cx="20.5" cy="21" r="2" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="22" height="18" rx="2" />
      <path d="M3 14h22M10 14v11M18 14v11" />
      <rect x="11" y="19" width="6" height="6" rx="1" />
      <path d="M9 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2L3 6v5c0 4.8 3.4 9.3 8 10.35C16.6 20.3 20 15.8 20 11V6l-9-4z" />
      <path d="M8 11l2 2 4-4" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L4 13h7l-1 7 8-11h-7l1-7z" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l2.8 5.7L20 8.7l-4.5 4.4 1.1 6.3L11 16.5l-5.6 2.9 1.1-6.3L2 8.7l6.2-.9L11 2z" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3.5" />
      <path d="M2 19v-1.5A5.5 5.5 0 0 1 7.5 12h1" />
      <circle cx="16" cy="9" r="3" />
      <path d="M20 19v-1a4 4 0 0 0-4-4h-1" />
    </svg>
  );
}

function IconTrend() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 7 12.5 14.5 7.5 9.5 2 15" />
      <polyline points="15 7 20 7 20 12" />
    </svg>
  );
}

function IconArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 9h11M9 3.5L14.5 9 9 14.5" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3.5 3.5L13 4" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h16M3 12h16M3 18h16" />
    </svg>
  );
}

/* ─── Data ─────────────────────────────────────────────────── */

const services = [
  {
    icon: <IconDocument />,
    title: "Government Documents",
    titleAr: "الوثائق الحكومية",
    description: "Extract and renew all your official papers and formal documents — fully handled from Egypt on your behalf, step by step.",
    badge: "Available Now",
    badgeColor: "bg-turquoise/10 text-turquoise",
    items: ["Birth Certificate", "Criminal Record", "Marriage Certificate", "Family Record"],
  },
  {
    icon: <IconCar />,
    title: "Limousine & Transportation",
    titleAr: "الليموزين والمشاوير",
    description: "Book premium rides and reliable airport transfers. Schedule in advance and arrive on time, every single time.",
    badge: "Coming Soon",
    badgeColor: "bg-navy/8 text-text-secondary",
    items: ["Airport Pickup", "City Transfers", "Event Transport", "Long Distance"],
  },
  {
    icon: <IconBuilding />,
    title: "Real Estate",
    titleAr: "العقارات",
    description: "Invest smarter and own faster. Discover the best property opportunities in Egypt with professional brokerage support.",
    badge: "Coming Soon",
    badgeColor: "bg-navy/8 text-text-secondary",
    items: ["Buy Property", "Sell Property", "Investment Advice", "Market Insights"],
  },
];

const steps = [
  {
    number: "01",
    title: "Sign Up",
    description: "Create your Inzerv account in minutes. Just a few details to get started.",
  },
  {
    number: "02",
    title: "Request Your Service",
    description: "Choose the service you need, fill in your details, and submit — guided step by step.",
  },
  {
    number: "03",
    title: "We Handle Everything",
    description: "Our team in Egypt takes care of all the logistics and official procedures on your behalf.",
  },
  {
    number: "04",
    title: "Track & Receive",
    description: "Follow your request in real time and receive your results simply, safely, and reliably.",
  },
];

const values = [
  { icon: <IconShield />, label: "Trust", desc: "Your data is safe" },
  { icon: <IconBolt />, label: "Speed", desc: "Fast & efficient" },
  { icon: <IconStar />, label: "Quality", desc: "Professional results" },
  { icon: <IconUsers />, label: "Professionalism", desc: "Expert team" },
  { icon: <IconTrend />, label: "Growth", desc: "Always improving" },
];

const govDocuments = [
  { en: "Birth Certificate", ar: "شهادة ميلاد" },
  { en: "Criminal Record", ar: "شهادة السوابق الجنائية" },
  { en: "Marriage Certificate", ar: "شهادة الزواج" },
  { en: "Family Record", ar: "سجل العائلة" },
];

/* ─── Page ──────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="bg-navy sticky top-0 z-50 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex items-center justify-between h-16">

          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo_full_white.jpg"
              alt="Inzerv"
              width={110}
              height={36}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Services", href: "#services" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Documents", href: "#documents" },
              { label: "Contact", href: "#contact" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="#"
              className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-150"
            >
              Sign In
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 bg-turquoise text-navy font-medium text-sm px-5 py-2.5 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
            >
              Get Started
            </Link>
          </div>

          <button className="md:hidden text-white/70 hover:text-white transition-colors">
            <IconMenu />
          </button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="bg-navy relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-turquoise/6 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-turquoise/4 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-24 lg:py-36 flex flex-col lg:flex-row items-center gap-16">

            {/* Left — Text */}
            <div className="flex-1 flex flex-col items-start">
              <span className="inline-flex items-center gap-2 border border-turquoise/30 text-turquoise text-xs font-medium px-4 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-turquoise animate-pulse" />
                Government Documents — Now Available
              </span>

              <h1 className="text-white font-semibold text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight">
                Your Egyptian Services,{" "}
                <span className="text-turquoise">Handled from Anywhere.</span>
              </h1>

              <p className="mt-6 text-white/60 text-lg leading-relaxed max-w-xl">
                Need something from Egypt? Consider it done.{" "}
                Inzerv handles your government documents, transportation, and real estate — step by step, on your behalf.
              </p>

              <p className="mt-4 text-white/40 text-sm italic">
                Designed with{" "}
                <span className="text-turquoise not-italic font-medium">purpose</span>.{" "}
                Built on{" "}
                <span className="text-turquoise not-italic font-medium">trust</span>.{" "}
                Made for{" "}
                <span className="text-turquoise not-italic font-medium">you</span>.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="#services"
                  className="inline-flex items-center gap-2 bg-turquoise text-navy font-semibold text-base px-7 py-3.5 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
                >
                  Start Your Service
                  <IconArrowRight />
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 border border-white/20 text-white font-medium text-base px-7 py-3.5 rounded-btn hover:border-white/40 hover:bg-white/5 transition-colors duration-150"
                >
                  How It Works
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3">
                {["Fully Secure & Encrypted", "Real-Time Tracking", "Official Procedures Only", "24/7 Support"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-white/45 text-sm">
                    <span className="text-turquoise"><IconCheck /></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Logo card */}
            <div className="shrink-0 w-full lg:w-80">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center gap-6 backdrop-blur-sm">
                <Image
                  src="/logo_full_white.jpg"
                  alt="Inzerv — Designed with purpose. Built on trust. Made for you."
                  width={220}
                  height={80}
                  className="w-full max-w-[200px] h-auto object-contain"
                />
                <div className="w-full border-t border-white/10 pt-6 flex flex-col gap-3">
                  {govDocuments.map((doc) => (
                    <div key={doc.en} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{doc.en}</span>
                      <span className="text-white/40 text-xs">{doc.ar}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="#"
                  className="w-full text-center bg-turquoise text-navy font-medium text-sm py-3 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
                >
                  Request a Document
                </Link>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-10 bg-bg-light"
            style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
          />
        </section>

        {/* ── Services ───────────────────────────────────────── */}
        <section id="services" className="bg-bg-light py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            <div className="text-center mb-14">
              <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-3">Our Services</p>
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl">
                Everything You Need, In One Place
              </h2>
              <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
                From official government documents to premium transport and real estate — Inzerv covers your most important needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="relative bg-white rounded-card p-8 flex flex-col gap-5 border border-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  <span className={`absolute top-6 right-6 text-xs font-medium px-2.5 py-1 rounded-full ${s.badgeColor}`}>
                    {s.badge}
                  </span>

                  <div className="w-14 h-14 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                    {s.icon}
                  </div>

                  <div>
                    <h3 className="text-navy font-semibold text-lg">{s.title}</h3>
                    <p className="text-text-secondary text-xs mt-0.5">{s.titleAr}</p>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed flex-1">{s.description}</p>

                  <ul className="flex flex-col gap-2">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-navy/70 text-sm">
                        <span className="text-turquoise shrink-0"><IconCheck /></span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="#"
                    className="inline-flex items-center gap-2 text-turquoise text-sm font-medium group mt-1"
                  >
                    {s.badge === "Available Now" ? "Get Started" : "Join Waitlist"}
                    <span className="group-hover:translate-x-0.5 transition-transform duration-150">
                      <IconArrowRight />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Government Documents Deep Dive ─────────────────── */}
        <section id="documents" className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">

              {/* Left — Logo */}
              <div className="shrink-0 w-full lg:w-96">
                <div className="bg-navy rounded-2xl p-10 flex flex-col items-center gap-8">
                  <Image
                    src="/logo_full_white.jpg"
                    alt="Inzerv"
                    width={200}
                    height={72}
                    className="w-full max-w-[180px] h-auto object-contain"
                  />
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {govDocuments.map((doc) => (
                      <div key={doc.en} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                        <p className="text-white text-xs font-medium leading-snug">{doc.en}</p>
                        <p className="text-white/40 text-xs mt-1">{doc.ar}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right — Content */}
              <div className="flex-1">
                <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-4">Government Documents</p>
                <h2 className="text-navy font-semibold text-3xl lg:text-4xl leading-snug">
                  All Your Official Papers,{" "}
                  <span className="text-turquoise">Sorted from Abroad.</span>
                </h2>
                <p className="mt-5 text-text-secondary text-base leading-relaxed">
                  Whether you are living outside Egypt or simply too busy to deal with bureaucracy, Inzerv handles every step of the process for you — from submission to delivery.
                </p>

                <div className="mt-8 flex flex-col gap-4">
                  {[
                    { title: "Submit Your Request Online", desc: "Fill in your details and we guide you step by step — no in-person visits required." },
                    { title: "We Handle the Paperwork", desc: "Our team in Egypt manages all official procedures and verifications on your behalf." },
                    { title: "Receive Your Documents", desc: "Choose delivery inside or outside Egypt. Track every update in real time." },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-turquoise/10 flex items-center justify-center text-turquoise shrink-0 mt-0.5">
                        <IconCheck />
                      </div>
                      <div>
                        <h4 className="text-navy font-semibold text-sm">{item.title}</h4>
                        <p className="text-text-secondary text-sm mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="#"
                  className="inline-flex items-center gap-2 mt-10 bg-turquoise text-navy font-semibold text-base px-7 py-3.5 rounded-btn hover:bg-turquoise/90 transition-colors duration-150"
                >
                  Request a Document
                  <IconArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ───────────────────────────────────── */}
        <section id="how-it-works" className="bg-bg-light py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">

            <div className="text-center mb-14">
              <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-3">Process</p>
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl">
                Simple Steps, Real Results
              </h2>
              <p className="mt-4 text-text-secondary text-base max-w-xl mx-auto leading-relaxed">
                We made it straightforward so you can focus on what matters — we handle the rest.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="flex flex-col gap-4">
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
            <p className="text-white/40 text-sm text-center uppercase tracking-widest mb-12">What We Stand For</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {values.map((v) => (
                <div key={v.label} className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-turquoise">
                    {v.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{v.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Data Safety Banner ─────────────────────────────── */}
        <section className="bg-bg-light py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-turquoise/10 text-turquoise mb-6">
              <IconShield />
            </div>
            <h2 className="text-navy font-semibold text-2xl lg:text-3xl">Your Data Is Safe</h2>
            <p className="mt-4 text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
              Your information is fully protected and encrypted. Only you can access it. Inzerv does not store your payment card details.
            </p>
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────── */}
        <section id="contact" className="bg-turquoise py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-navy font-semibold text-3xl lg:text-4xl">
                Ready to Start Your Service?
              </h2>
              <p className="mt-3 text-navy/70 text-base max-w-xl leading-relaxed">
                Join thousands who trust Inzerv to handle their most important needs — from anywhere in the world.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Link
                href="#"
                className="inline-flex items-center gap-2 bg-navy text-white font-semibold text-base px-8 py-4 rounded-btn hover:bg-navy-deep transition-colors duration-150"
              >
                Get Started Today
                <IconArrowRight />
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 border-2 border-navy/20 text-navy font-medium text-base px-8 py-4 rounded-btn hover:border-navy/40 transition-colors duration-150"
              >
                Download the App
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-navy-deep">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/10">

            {/* Brand */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <Image
                src="/logo_full_white.jpg"
                alt="Inzerv"
                width={110}
                height={38}
                className="h-9 w-auto object-contain"
              />
              <p className="text-white/40 text-sm leading-relaxed">
                Designed with purpose.<br />
                Built on trust.<br />
                Made for you.
              </p>
            </div>

            {/* Services */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-sm font-semibold mb-1">Services</h4>
              {["Government Documents", "Limousine & Transport", "Real Estate"].map((item) => (
                <Link key={item} href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150">{item}</Link>
              ))}
            </div>

            {/* Documents */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-sm font-semibold mb-1">Documents</h4>
              {govDocuments.map((doc) => (
                <Link key={doc.en} href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150">{doc.en}</Link>
              ))}
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-3">
              <h4 className="text-white text-sm font-semibold mb-1">Legal</h4>
              {["Privacy Policy", "Terms & Conditions", "Help & Support", "FAQs"].map((item) => (
                <Link key={item} href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150">{item}</Link>
              ))}
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2026 Inzerv Group for Digital Marketing & Brokerage. All rights reserved.</p>
            <p className="text-white/20 text-xs">Confidential — Internal & Approved Partners Only</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
