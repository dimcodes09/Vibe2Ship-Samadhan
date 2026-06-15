import { useState, useEffect } from "react";
import { documentService } from "../services/documentService";
import { DocumentLockerDetails } from "@/shared/types/domain/Document";
import { logger } from "@/shared/services/logger";

export function useDocuments() {
  const [lockerDetails, setLockerDetails] = useState<DocumentLockerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await documentService.getLockerDetails();
        if (active) {
          setLockerDetails(data);
          setError(null);
        }
      } catch (err: any) {
        logger.error("Failed to load documents locker details:", err);
        if (active) {
          setError(err.message || "Failed to load locker documents");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return {
    lockerDetails,
    loading,
    error,
  };
}
