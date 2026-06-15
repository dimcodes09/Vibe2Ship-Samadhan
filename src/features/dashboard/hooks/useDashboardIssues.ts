import { useState, useEffect, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import { issueRepository, issueService } from "@/features/issues";
import { dashboardService, DashboardStats } from "../services/dashboardService";
import { Issue } from "@/shared/types/domain/Issue";
import { useToast } from "@/shared/hooks/use-toast";
import { logger } from "@/shared/services/logger";
import { APIError } from "@/shared/errors/errors";

export function useDashboardIssues(user: User | null, activeLanguage: "en" | "hi") {
  const { toast } = useToast();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [supportedIssues, setSupportedIssues] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [supportingId, setSupportingId] = useState<string | null>(null);

  useEffect(() => {
    fetchIssues();
    if (user) {
      fetchUserSupports();
    } else {
      setSupportedIssues(new Set());
    }
  }, [user]);

  // Memoize stats to avoid extra render cycles
  const stats = useMemo<DashboardStats>(() => {
    return dashboardService.calculateStats(issues);
  }, [issues]);

  // Realtime subscription setup
  useEffect(() => {
    const unsubscribe = issueRepository.subscribeToIssuesChange((payload) => {
      logger.info("Realtime reported_issues change received:", payload);
      if (payload.eventType === "INSERT") {
        const newIssue = issueService.mapResponseToDomain(payload.new as any);
        setIssues((prev) => [newIssue, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        const updatedIssue = issueService.mapResponseToDomain(payload.new as any);
        setIssues((prev) =>
          prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue))
        );
      } else if (payload.eventType === "DELETE") {
        setIssues((prev) => prev.filter((issue) => issue.id !== payload.old.id));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const raw = await issueRepository.fetchAllIssues(20);
      const mapped = raw.map((item) => issueService.mapResponseToDomain(item));
      setIssues(mapped);
    } catch (err) {
      logger.error("Failed to load issues:", err);
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: activeLanguage === "en" ? "Failed to load issues" : "समस्याएं लोड करने में विफल",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSupports = async () => {
    if (!user) return;
    try {
      const supports = await issueRepository.fetchUserSupports(user.id);
      setSupportedIssues(new Set(supports.map((s) => s.issue_id)));
    } catch (err) {
      logger.error("Failed to load user supports:", err);
    }
  };

  const handleSupport = async (issueId: string) => {
    if (!user) {
      toast({
        title: activeLanguage === "en" ? "Sign in Required" : "साइन इन आवश्यक",
        description:
          activeLanguage === "en"
            ? "Please sign in to support this issue."
            : "इस समस्या का समर्थन करने के लिए कृपया साइन इन करें।",
        variant: "destructive",
      });
      return;
    }

    setSupportingId(issueId);
    const isSupported = supportedIssues.has(issueId);

    // Optimistic UI updates
    setSupportedIssues((prev) => {
      const updated = new Set(prev);
      if (isSupported) updated.delete(issueId);
      else updated.add(issueId);
      return updated;
    });

    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              supportsCount: Math.max(0, issue.supportsCount + (isSupported ? -1 : 1)),
            }
          : issue
      )
    );

    try {
      await issueService.toggleSupport(issueId, user.id, isSupported);
      if (!isSupported) {
        toast({
          title: activeLanguage === "en" ? "Issue Supported!" : "समस्या समर्थित!",
          description:
            activeLanguage === "en"
              ? "Thank you for supporting this community issue."
              : "इस सामुदायिक समस्या का समर्थन करने के लिए धन्यवाद।",
        });
      }
    } catch (err: any) {
      logger.error("Failed to toggle support:", err);
      // Rollback optimistic state
      setSupportedIssues((prev) => {
        const rollback = new Set(prev);
        if (isSupported) rollback.add(issueId);
        else rollback.delete(issueId);
        return rollback;
      });
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? {
                ...issue,
                supportsCount: Math.max(0, issue.supportsCount + (isSupported ? 1 : -1)),
              }
            : issue
        )
      );

      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: err.message || "Failed to process support request.",
        variant: "destructive",
      });
    } finally {
      setSupportingId(null);
    }
  };

  return {
    issues,
    supportedIssues,
    loading,
    supportingId,
    stats,
    handleSupport,
    refetch: fetchIssues,
  };
}
