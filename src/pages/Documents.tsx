import { Header } from "@/components/layout/Header";
import { DocumentLockerSection } from "@/components/sections/DocumentLockerSection";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const Documents = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-16">
        <DocumentLockerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Documents;
