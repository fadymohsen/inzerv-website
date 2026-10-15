import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconCheck } from "@/components/ui/icons";
import { govDocuments } from "@/lib/data";

const trustItems = [
  "Fully Secure & Encrypted",
  "Real-Time Tracking",
  "Official Procedures Only",
  "24/7 Support",
];

export default function HeroSection() {
  return (
    <section className="bg-navy relative overflow-hidden">
      {/* Ambient background glows */}
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
            Need something from Egypt? Consider it done. Inzerv handles your government
            documents, transportation, and real estate — step by step, on your behalf.
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
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/45 text-sm">
                <span className="text-turquoise"><IconCheck /></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Document preview card */}
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

      {/* Bottom wave divider */}
      <div
        className="absolute bottom-0 left-0 right-0 h-10 bg-bg-light"
        style={{ clipPath: "ellipse(60% 100% at 50% 100%)" }}
      />
    </section>
  );
}
