import { IconShield, IconBolt, IconStar, IconUsers, IconTrend } from "@/components/ui/icons";

const values = [
  { icon: <IconShield />, label: "Trust",            desc: "Your data is safe" },
  { icon: <IconBolt />,   label: "Speed",            desc: "Fast & efficient" },
  { icon: <IconStar />,   label: "Quality",          desc: "Professional results" },
  { icon: <IconUsers />,  label: "Professionalism",  desc: "Expert team" },
  { icon: <IconTrend />,  label: "Growth",           desc: "Always improving" },
];

export default function ValuesSection() {
  return (
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
              <div>
                <p className="text-white font-medium text-sm">{v.label}</p>
                <p className="text-white/40 text-xs mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
