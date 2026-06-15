import { documentRepository } from "../repositories/documentRepository";
import { DocumentLockerDetails } from "@/shared/types/domain/Document";

export const documentService = {
  async getLockerDetails(): Promise<DocumentLockerDetails> {
    return documentRepository.fetchLockerDetails();
  },
};
