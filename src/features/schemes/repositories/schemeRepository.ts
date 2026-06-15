import { Scheme } from "@/shared/types/domain/Scheme";
import React from "react";
// We import icons here for the mock data setup
import { 
  Home, 
  Heart, 
  Briefcase, 
  GraduationCap 
} from "lucide-react";

const mockSchemes: Scheme[] = [
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
    icon: React.createElement(Home, { className: "w-5 h-5" }),
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
    icon: React.createElement(Heart, { className: "w-5 h-5" }),
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
    icon: React.createElement(Briefcase, { className: "w-5 h-5" }),
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
    icon: React.createElement(GraduationCap, { className: "w-5 h-5" }),
  },
];

export const schemeRepository = {
  async fetchAllSchemes(): Promise<Scheme[]> {
    // Return mock data for schemes in this phase
    return [...mockSchemes];
  },
};
