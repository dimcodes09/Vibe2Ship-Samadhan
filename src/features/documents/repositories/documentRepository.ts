import { DocumentLockerDetails } from "@/shared/types/domain/Document";
import React from "react";
import { CreditCard, FileText, GraduationCap, Home } from "lucide-react";

export const documentRepository = {
  async fetchLockerDetails(): Promise<DocumentLockerDetails> {
    return {
      totalFiles: 12,
      totalSizeMb: 24,
      documents: [
        { icon: React.createElement(CreditCard, { className: "w-5 h-5" }), name: "Aadhaar Card", status: "verified" },
        { icon: React.createElement(FileText, { className: "w-5 h-5" }), name: "PAN Card", status: "verified" },
        { icon: React.createElement(GraduationCap, { className: "w-5 h-5" }), name: "Education Certificates", status: "3 files" },
        { icon: React.createElement(Home, { className: "w-5 h-5" }), name: "Property Documents", status: "expires soon" },
      ],
    };
  },
};
