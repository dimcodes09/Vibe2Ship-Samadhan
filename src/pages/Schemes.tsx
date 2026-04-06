import { Header } from "@/components/layout/Header";
import { SchemesSection } from "@/components/sections/SchemesSection";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const Schemes = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-16">
        <SchemesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Schemes;
