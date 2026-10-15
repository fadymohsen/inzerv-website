import Image from "next/image";
import Link from "next/link";
import { govDocuments } from "@/lib/data";

const serviceLinks = ["Government Documents", "Limousine & Transport", "Real Estate"];
const legalLinks   = ["Privacy Policy", "Terms & Conditions", "Help & Support", "FAQs"];

export default function Footer() {
  return (
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
            {serviceLinks.map((item) => (
              <Link
                key={item}
                href="#"
                className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Documents */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white text-sm font-semibold mb-1">Documents</h4>
            {govDocuments.map((doc) => (
              <Link
                key={doc.en}
                href="#"
                className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
              >
                {doc.en}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white text-sm font-semibold mb-1">Legal</h4>
            {legalLinks.map((item) => (
              <Link
                key={item}
                href="#"
                className="text-white/40 hover:text-white/70 text-sm transition-colors duration-150"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 Inzerv Group for Digital Marketing & Brokerage. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">Confidential — Internal & Approved Partners Only</p>
        </div>
      </div>
    </footer>
  );
}
