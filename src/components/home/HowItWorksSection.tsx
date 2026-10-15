import { steps } from "@/lib/data";

export default function HowItWorksSection() {
  return (
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
  );
}
