import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import {
  MapPin,
  Camera,
  Mic,
  FileText,
  Droplets,
  Trash2,
  Zap,
  Construction,
  TreePine,
  Building2,
  Send,
  Loader2,
  LogIn
} from "lucide-react";

const categories = [
  { id: "water", icon: Droplets, labelEn: "Water Supply", labelHi: "जल आपूर्ति" },
  { id: "sanitation", icon: Trash2, labelEn: "Sanitation", labelHi: "स्वच्छता" },
  { id: "electricity", icon: Zap, labelEn: "Electricity", labelHi: "बिजली" },
  { id: "roads", icon: Construction, labelEn: "Roads", labelHi: "सड़कें" },
  { id: "parks", icon: TreePine, labelEn: "Parks & Gardens", labelHi: "पार्क और बगीचे" },
  { id: "buildings", icon: Building2, labelEn: "Buildings", labelHi: "भवन" },
];

// Validation schema
const issueSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().trim().min(5, "Location must be at least 5 characters").max(500, "Location must be less than 500 characters"),
});

const detectionToCategory = (cls: string): string | null => {
  const c = cls.toLowerCase();
  if (c.includes("pothole")) return "roads";
  if (c.includes("garbage") || c.includes("trash") || c.includes("waste")) return "sanitation";
  if (c.includes("civic")) return "buildings";
  return null;
};

const ReportIssue = () => {
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [annotatedImage, setAnnotatedImage] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [detectedClasses, setDetectedClasses] = useState<string[]>([]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setAnnotatedImage(null);
    setDetectedClasses([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      const base64 = dataUrl.split(",")[1];

      setDetecting(true);
      try {
        const { data, error } = await supabase.functions.invoke("detect-issue", {
          body: { imageBase64: base64 },
        });
        if (error) throw error;
        if (data?.classes?.length) {
          setDetectedClasses(data.classes);
          if (data.annotatedImage) setAnnotatedImage(`data:image/jpeg;base64,${data.annotatedImage}`);
          const mapped = detectionToCategory(data.top);
          if (mapped) setSelectedCategory(mapped);
          toast({
            title: language === "en" ? "Detection complete" : "पहचान पूर्ण",
            description: `${language === "en" ? "Detected" : "पाया गया"}: ${data.classes.join(", ")}`,
          });
        } else {
          toast({
            title: language === "en" ? "No issues detected" : "कोई समस्या नहीं मिली",
            description: language === "en" ? "Please select a category manually." : "कृपया श्रेणी मैन्युअल रूप से चुनें।",
          });
        }
      } catch (err: any) {
        toast({ title: "Detection failed", description: err.message, variant: "destructive" });
      } finally {
        setDetecting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getCategoryLabel = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? (language === "en" ? cat.labelEn : cat.labelHi) : id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast({
        title: language === "en" ? "Sign in Required" : "साइन इन आवश्यक",
        description: language === "en" 
          ? "Please sign in to report an issue." 
          : "समस्या दर्ज करने के लिए कृपया साइन इन करें।",
        variant: "destructive",
      });
      navigate("/signin");
      return;
    }

    // Validate input
    const result = issueSchema.safeParse({
      title,
      description,
      category: selectedCategory || "",
      location,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("reported_issues").insert({
        user_id: user.id,
        title: result.data.title,
        description: result.data.description,
        category: getCategoryLabel(result.data.category),
        location: result.data.location,
        status: "reported",
      });

      if (error) throw error;

      toast({
        title: language === "en" ? "Issue Reported!" : "समस्या दर्ज!",
        description: language === "en" 
          ? "Your issue has been submitted successfully. The community can now support it." 
          : "आपकी समस्या सफलतापूर्वक दर्ज की गई है। समुदाय अब इसका समर्थन कर सकता है।",
      });

      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-background relative">
        <BackgroundPattern />
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {language === "en" ? "Sign In Required" : "साइन इन आवश्यक"}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === "en" 
                  ? "You need to sign in to report civic issues." 
                  : "नागरिक समस्याओं की रिपोर्ट करने के लिए आपको साइन इन करना होगा।"}
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/signin")}>
                  {language === "en" ? "Sign In" : "साइन इन"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/signup")}>
                  {language === "en" ? "Create Account" : "खाता बनाएं"}
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
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
                  {language === "en" ? "Select Category" : "श्रेणी चुनें"} *
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
                {errors.category && (
                  <p className="text-sm text-destructive mt-2">{errors.category}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  {language === "en" ? "Issue Title" : "समस्या का शीर्षक"} *
                </Label>
                <Input
                  id="title"
                  placeholder={language === "en" ? "Brief description of the issue" : "समस्या का संक्षिप्त विवरण"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {language === "en" ? "Detailed Description" : "विस्तृत विवरण"} *
                </Label>
                <Textarea
                  id="description"
                  placeholder={language === "en" ? "Provide more details about the issue..." : "समस्या के बारे में अधिक जानकारी दें..."}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  {language === "en" ? "Location" : "स्थान"} *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder={language === "en" ? "Enter address or landmark" : "पता या लैंडमार्क दर्ज करें"}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                    maxLength={500}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>

              {/* Photo Upload (placeholder) */}
              <div className="space-y-2">
                <Label>
                  {language === "en" ? "Add Photos (Optional)" : "फोटो जोड़ें (वैकल्पिक)"}
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
                <Button type="button" variant="voice" size="icon">
                  <Mic className="w-5 h-5" />
                </Button>
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "en" ? "Submitting..." : "सबमिट हो रहा है..."}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {language === "en" ? "Submit Report" : "रिपोर्ट सबमिट करें"}
                  </>
                )}
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
