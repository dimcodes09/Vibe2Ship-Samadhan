import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Camera,
  Upload,
  Mic,
  FileText,
  Droplets,
  Trash2,
  Zap,
  Construction,
  TreePine,
  Building2,
  Send
} from "lucide-react";

const categories = [
  { id: "water", icon: Droplets, labelEn: "Water Supply", labelHi: "जल आपूर्ति" },
  { id: "sanitation", icon: Trash2, labelEn: "Sanitation", labelHi: "स्वच्छता" },
  { id: "electricity", icon: Zap, labelEn: "Electricity", labelHi: "बिजली" },
  { id: "roads", icon: Construction, labelEn: "Roads", labelHi: "सड़कें" },
  { id: "parks", icon: TreePine, labelEn: "Parks & Gardens", labelHi: "पार्क और बगीचे" },
  { id: "buildings", icon: Building2, labelEn: "Buildings", labelHi: "भवन" },
];

const ReportIssue = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: language === "en" ? "Issue Reported!" : "समस्या दर्ज!",
      description: language === "en" 
        ? "Your issue has been submitted successfully." 
        : "आपकी समस्या सफलतापूर्वक दर्ज की गई है।",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full text-secondary text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                {language === "en" ? "Report a Civic Issue" : "नागरिक समस्या की रिपोर्ट करें"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                {language === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
              </h1>
              <p className="text-muted-foreground">
                {language === "en" 
                  ? "Help improve your community by reporting civic issues." 
                  : "नागरिक समस्याओं की रिपोर्ट करके अपने समुदाय को बेहतर बनाने में मदद करें।"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Category Selection */}
              <div>
                <Label className="text-base mb-4 block">
                  {language === "en" ? "Select Category" : "श्रेणी चुनें"}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedCategory === cat.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <cat.icon className={`w-6 h-6 mb-2 ${
                        selectedCategory === cat.id ? "text-primary" : "text-muted-foreground"
                      }`} />
                      <p className="font-medium text-sm">
                        {language === "en" ? cat.labelEn : cat.labelHi}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {language === "en" ? "Issue Title" : "समस्या का शीर्षक"}
                </Label>
                <Input
                  id="title"
                  placeholder={language === "en" ? "Brief description of the issue" : "समस्या का संक्षिप्त विवरण"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {language === "en" ? "Detailed Description" : "विस्तृत विवरण"}
                </Label>
                <Textarea
                  id="description"
                  placeholder={language === "en" ? "Provide more details about the issue..." : "समस्या के बारे में अधिक जानकारी दें..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  {language === "en" ? "Location" : "स्थान"}
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder={language === "en" ? "Enter address or use current location" : "पता दर्ज करें या वर्तमान स्थान का उपयोग करें"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2">
                  <MapPin className="w-4 h-4" />
                  {language === "en" ? "Use Current Location" : "वर्तमान स्थान का उपयोग करें"}
                </Button>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>
                  {language === "en" ? "Add Photos" : "फोटो जोड़ें"}
                </Label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {language === "en" ? "Click to upload or drag and drop" : "अपलोड करने के लिए क्लिक करें या खींचें और छोड़ें"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </div>

              {/* Voice Description */}
              <div className="bg-muted/50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">
                    {language === "en" ? "Or describe by voice" : "या आवाज से बताएं"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "en" ? "Tap to record your issue description" : "समस्या का विवरण रिकॉर्ड करने के लिए टैप करें"}
                  </p>
                </div>
                <Button variant="voice" size="icon">
                  <Mic className="w-5 h-5" />
                </Button>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full">
                <Send className="w-5 h-5" />
                {language === "en" ? "Submit Report" : "रिपोर्ट सबमिट करें"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportIssue;
