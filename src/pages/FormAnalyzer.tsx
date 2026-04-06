import { Header } from "@/components/layout/Header";
import { FormAnalyzerSection } from "@/components/sections/FormAnalyzerSection";
import { AIAssistantSection } from "@/components/sections/AIAssistantSection";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";

const FormAnalyzer = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-16">
        <FormAnalyzerSection />
        <AIAssistantSection />
      </main>
      <Footer />
    </div>
  );
};

export default FormAnalyzer;
