import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import DocumentsSection from "@/components/home/DocumentsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import ValuesSection from "@/components/home/ValuesSection";
import SafetySection from "@/components/home/SafetySection";
import CtaSection from "@/components/home/CtaSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ServicesSection />
        <DocumentsSection />
        <HowItWorksSection />
        <ValuesSection />
        <SafetySection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
