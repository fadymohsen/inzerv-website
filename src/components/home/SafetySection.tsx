import { IconShield } from "@/components/ui/icons";

export default function SafetySection() {
  return (
    <section className="bg-bg-light py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-turquoise/10 text-turquoise mb-6">
          <IconShield />
        </div>
        <h2 className="text-navy font-semibold text-2xl lg:text-3xl">Your Data Is Safe</h2>
        <p className="mt-4 text-text-secondary text-base leading-relaxed max-w-xl mx-auto">
          Your information is fully protected and encrypted. Only you can access it.
          Inzerv does not store your payment card details.
        </p>
      </div>
    </section>
  );
}
