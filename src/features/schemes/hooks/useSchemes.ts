import { useState, useEffect } from "react";
import { schemeService } from "../services/schemeService";
import { Scheme } from "@/shared/types/domain/Scheme";
import { logger } from "@/shared/services/logger";

export function useSchemes() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await schemeService.getSchemes();
        if (active) {
          setSchemes(data);
          setError(null);
        }
      } catch (err: any) {
        logger.error("Failed to load schemes:", err);
        if (active) {
          setError(err.message || "Failed to load schemes");
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
    schemes,
    loading,
    error,
  };
}
