import Link from "next/link";
import { buttonClass } from "@/components/Button";
import { ArrowIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-5 py-20 text-center lg:px-8">
        <p className="text-8xl font-semibold text-navy">404</p>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-[44ch] text-lg text-ink-muted">
          The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/en" className={buttonClass("primary", "group/btn min-h-12 px-6")}>
            Go home
            <ArrowIcon size={18} />
          </Link>
          <Link href="/en/services" className={buttonClass("outline", "min-h-12 px-6")}>
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
