import Link from "next/link";
import { IconDocument, IconCar, IconBuilding, IconCheck, IconArrowRight } from "@/components/ui/icons";

const services = [
  {
    icon: <IconDocument />,
    title: "Government Documents",
    titleAr: "الوثائق الحكومية",
    description:
      "Extract and renew all your official papers and formal documents — fully handled from Egypt on your behalf, step by step.",
    badge: "Available Now",
    badgeColor: "bg-turquoise/10 text-turquoise",
    items: ["Birth Certificate", "Criminal Record", "Marriage Certificate", "Family Record"],
  },
  {
    icon: <IconCar />,
    title: "Limousine & Transportation",
    titleAr: "الليموزين والمشاوير",
    description:
      "Book premium rides and reliable airport transfers. Schedule in advance and arrive on time, every single time.",
    badge: "Coming Soon",
    badgeColor: "bg-black/5 text-text-secondary",
    items: ["Airport Pickup", "City Transfers", "Event Transport", "Long Distance"],
  },
  {
    icon: <IconBuilding />,
    title: "Real Estate",
    titleAr: "العقارات",
    description:
      "Invest smarter and own faster. Discover the best property opportunities in Egypt with professional brokerage support.",
    badge: "Coming Soon",
    badgeColor: "bg-black/5 text-text-secondary",
    items: ["Buy Property", "Sell Property", "Investment Advice", "Market Insights"],
  },
];

export default function ServicesSection() {
  return (
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
  );
}
