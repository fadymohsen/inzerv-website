import Image from "next/image";
import Link from "next/link";
import { IconCheck, IconArrowRight } from "@/components/ui/icons";
import { govDocuments } from "@/lib/data";

const features = [
  {
    title: "Submit Your Request Online",
    desc: "Fill in your details and we guide you step by step — no in-person visits required.",
  },
  {
    title: "We Handle the Paperwork",
    desc: "Our team in Egypt manages all official procedures and verifications on your behalf.",
  },
  {
    title: "Receive Your Documents",
    desc: "Choose delivery inside or outside Egypt. Track every update in real time.",
  },
];

export default function DocumentsSection() {
  return (
    <section id="documents" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">

          {/* Left — Visual card */}
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
                  <div
                    key={doc.en}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
                  >
                    <p className="text-white text-xs font-medium leading-snug">{doc.en}</p>
                    <p className="text-white/40 text-xs mt-1">{doc.ar}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div className="flex-1">
            <p className="text-turquoise text-sm font-medium uppercase tracking-widest mb-4">
              Government Documents
            </p>
            <h2 className="text-navy font-semibold text-3xl lg:text-4xl leading-snug">
              All Your Official Papers,{" "}
              <span className="text-turquoise">Sorted from Abroad.</span>
            </h2>
            <p className="mt-5 text-text-secondary text-base leading-relaxed">
              Whether you are living outside Egypt or simply too busy to deal with bureaucracy,
              Inzerv handles every step of the process for you — from submission to delivery.
            </p>

            <div className="mt-8 flex flex-col gap-5">
              {features.map((item) => (
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
  );
}
