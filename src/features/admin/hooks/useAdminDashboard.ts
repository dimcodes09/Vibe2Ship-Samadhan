import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/shared/hooks/use-toast";
import { adminService } from "../services/adminService";
import { Issue } from "@/shared/types/domain/Issue";
import { IssueStatus } from "@/shared/types/domain/IssueStatus";
import { logger } from "@/shared/services/logger";
import { ROUTES } from "@/shared/config/routes";

export function useAdminDashboard(user: User | null, authLoading: boolean, activeLanguage: "en" | "hi") {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(ROUTES.SIGN_IN);
      return;
    }
    
    (async () => {
      try {
        const adminCheck = await adminService.checkIsAdmin(user.id);
        setIsAdmin(adminCheck);
        if (adminCheck) {
          await loadIssues();
        }
      } catch (err) {
        logger.error("Failed to resolve admin permissions check:", err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, authLoading]);

  const loadIssues = async () => {
    try {
      const items = await adminService.fetchAllIssuesAdmin();
      setIssues(items);
    } catch (err: any) {
      logger.error("Failed to load admin issues:", err);
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: err.message || "Failed to load issues feed.",
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (id: string, status: IssueStatus) => {
    try {
      await adminService.updateIssueStatusAdmin(id, status);
      setIssues((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status } : i))
      );
      toast({
        title: activeLanguage === "en" ? "Status updated" : "स्थिति अपडेट की गई",
      });
    } catch (error: any) {
      logger.error("Failed to update status:", error);
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: error.message || "Failed to update issue status.",
        variant: "destructive",
      });
    }
  };

  const deleteIssue = async (id: string) => {
    try {
      await adminService.deleteIssueAdmin(id);
      setIssues((prev) => prev.filter((i) => i.id !== id));
      toast({
        title: activeLanguage === "en" ? "Issue deleted" : "समस्या हटा दी गई",
      });
    } catch (error: any) {
      logger.error("Failed to delete issue:", error);
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: error.message || "Failed to delete issue report.",
        variant: "destructive",
      });
    }
  };

  return {
    isAdmin,
    issues,
    loading,
    updateStatus,
    deleteIssue,
    refetch: loadIssues,
  };
}
