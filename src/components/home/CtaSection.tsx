import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

export default function CtaSection() {
  return (
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
  );
}
