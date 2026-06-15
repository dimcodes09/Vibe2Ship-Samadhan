import React from "react";

export interface DocumentType {
  icon?: React.ReactNode;
  name: string;
  status: string;
}

export interface DocumentLockerDetails {
  totalFiles: number;
  totalSizeMb: number;
  documents: DocumentType[];
}
