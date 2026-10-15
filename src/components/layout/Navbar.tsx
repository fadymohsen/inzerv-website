import Image from "next/image";
import Link from "next/link";
import { IconMenu } from "@/components/ui/icons";

const navLinks = [
  { label: "Services",     href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Documents",    href: "#documents" },
  { label: "Contact",      href: "#contact" },
];

export default function Navbar() {
  return (
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
          {navLinks.map((item) => (
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
  );
}
