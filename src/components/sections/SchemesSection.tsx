import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Briefcase,
  GraduationCap,
  Heart,
  Home,
  Sparkles,
  AlertCircle
} from "lucide-react";

interface Scheme {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  categoryEn: string;
  categoryHi: string;
  eligibilityEn: string[];
  eligibilityHi: string[];
  deadlineEn?: string;
  deadlineHi?: string;
  isEligible: boolean;
  trustScore: number;
  icon: React.ReactNode;
}

const schemes: Scheme[] = [
  {
    id: "1",
    titleEn: "PM Awas Yojana - Urban",
    titleHi: "पीएम आवास योजना - शहरी",
    descriptionEn: "Financial assistance for construction of pucca house to eligible urban poor",
    descriptionHi: "पात्र शहरी गरीबों को पक्का मकान बनाने के लिए वित्तीय सहायता",
    categoryEn: "Housing",
    categoryHi: "आवास",
    eligibilityEn: ["Annual income < ₹3L", "No pucca house"],
    eligibilityHi: ["वार्षिक आय < ₹3L", "कोई पक्का मकान नहीं"],
    deadlineEn: "March 2026",
    deadlineHi: "मार्च 2026",
    isEligible: true,
    trustScore: 98,
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "2",
    titleEn: "Ayushman Bharat Yojana",
    titleHi: "आयुष्मान भारत योजना",
    descriptionEn: "Health coverage of ₹5 lakh per family per year for secondary and tertiary care",
    descriptionHi: "माध्यमिक और तृतीयक देखभाल के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का स्वास्थ्य कवरेज",
    categoryEn: "Healthcare",
    categoryHi: "स्वास्थ्य",
    eligibilityEn: ["SECC database listed", "No other insurance"],
    eligibilityHi: ["SECC डेटाबेस में सूचीबद्ध", "कोई अन्य बीमा नहीं"],
    isEligible: true,
    trustScore: 100,
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "3",
    titleEn: "PM Vishwakarma Scheme",
    titleHi: "पीएम विश्वकर्मा योजना",
    descriptionEn: "Support for traditional artisans with skill training and financial assistance",
    descriptionHi: "पारंपरिक कारीगरों को कौशल प्रशिक्षण और वित्तीय सहायता",
    categoryEn: "Employment",
    categoryHi: "रोजगार",
    eligibilityEn: ["Traditional artisan", "Age 18+"],
    eligibilityHi: ["पारंपरिक कारीगर", "आयु 18+"],
    isEligible: false,
    trustScore: 95,
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "4",
    titleEn: "National Scholarship Portal",
    titleHi: "राष्ट्रीय छात्रवृत्ति पोर्टल",
    descriptionEn: "Various scholarships for students from pre-matric to post-doctoral level",
    descriptionHi: "प्री-मैट्रिक से पोस्ट-डॉक्टोरल स्तर तक के छात्रों के लिए विभिन्न छात्रवृत्तियां",
    categoryEn: "Education",
    categoryHi: "शिक्षा",
    eligibilityEn: ["Student status", "Income criteria varies"],
    eligibilityHi: ["छात्र स्थिति", "आय मानदंड भिन्न"],
    deadlineEn: "December 2025",
    deadlineHi: "दिसंबर 2025",
    isEligible: true,
    trustScore: 100,
    icon: <GraduationCap className="w-5 h-5" />,
  },
];

export function SchemesSection() {
  const { t, language } = useLanguage();

  return (
    <section id="schemes" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            {t("schemes.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t("schemes.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("schemes.subtitle")}
          </p>
        </div>

        {/* Eligible Highlight */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("schemes.eligibleDesc")}</h3>
              <p className="text-sm text-muted-foreground">
                {language === "en" ? "Based on your profile and location" : "आपकी प्रोफ़ाइल और स्थान के आधार पर"}
              </p>
            </div>
          </div>
          <Button variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90">
            {t("schemes.checkEligibility")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {schemes.map((scheme, index) => (
            <SchemeCard key={scheme.id} scheme={scheme} index={index} />
          ))}
        </div>

        {/* Fake Policy Warning */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">{t("schemes.fakeWarning")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("schemes.fakeDesc")}
            </p>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
              {t("schemes.reportFake")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
  const { t, language } = useLanguage();

  const title = language === "en" ? scheme.titleEn : scheme.titleHi;
  const description = language === "en" ? scheme.descriptionEn : scheme.descriptionHi;
  const category = language === "en" ? scheme.categoryEn : scheme.categoryHi;
  const eligibility = language === "en" ? scheme.eligibilityEn : scheme.eligibilityHi;
  const deadline = language === "en" ? scheme.deadlineEn : scheme.deadlineHi;

  return (
    <div 
      className="group bg-card rounded-2xl border border-border shadow-card hover:shadow-lg transition-all overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {scheme.icon}
            </div>
            <div>
              <Badge variant="secondary" className="text-xs mb-1">
                {category}
              </Badge>
              {deadline && (
                <p className="text-xs text-warning font-medium">
                  {t("schemes.deadline")}: {deadline}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-accent/10 rounded-full">
            <Shield className="w-3 h-3 text-accent" />
            <span className="text-xs font-medium text-accent">{scheme.trustScore}%</span>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {description}
        </p>

        {/* Eligibility */}
        <div className="flex flex-wrap gap-2 mb-4">
          {eligibility.map((item, i) => (
            <span 
              key={i}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-lg text-xs"
            >
              <Users className="w-3 h-3" />
              {item}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          {scheme.isEligible ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              <CheckCircle2 className="w-4 h-4" />
              {t("schemes.mayBeEligible")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">
              {t("schemes.checkEligibility")}
            </span>
          )}
          <Button variant="ghost" size="sm" className="gap-1">
            {t("schemes.learnMore")}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
