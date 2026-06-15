import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/shared/hooks/use-toast";
import { profileSchema } from "../validation/profileSchema";
import { profileService } from "../services/profileService";
import { issueService, issueRepository } from "@/features/issues";
import { Profile } from "@/shared/types/domain/Profile";
import { Issue } from "@/shared/types/domain/Issue";
import { NotificationPreferences } from "@/shared/types/domain/NotificationPreference";
import { logger } from "@/shared/services/logger";

export function useProfileData(user: User | null, activeLanguage: "en" | "hi") {
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch Profile
      const prof = await profileService.getProfile(user.id);
      setProfile(prof);

      // Fetch user reported issues
      const rawIssues = await issueRepository.fetchUserIssues(user.id);
      const mappedIssues = rawIssues.map((item) => issueService.mapResponseToDomain(item));
      setIssues(mappedIssues);

      // Fetch notifications
      const notifs = await profileService.getNotificationPreferences(user.id);
      setNotifications(notifs);
    } catch (err) {
      logger.error("Failed to fetch profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !user) return;

    // Validate using Zod schema
    const validationResult = profileSchema.safeParse({
      fullName: profile.fullName,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      preferredLanguage: profile.preferredLanguage,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Validation failed";
      toast({
        title: activeLanguage === "en" ? "Validation Error" : "सत्यापन त्रुटि",
        description: firstError,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updated = await profileService.updateProfile(user.id, validationResult.data);
      setProfile(updated);
      toast({
        title: activeLanguage === "en" ? "Profile Updated" : "प्रोफ़ाइल अपडेट",
        description: activeLanguage === "en" ? "Your profile has been saved." : "आपकी प्रोफ़ाइल सहेजी गई।",
      });
    } catch (error: any) {
      logger.error("Failed to update profile:", error);
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: error.message || "Failed to update profile details.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    if (!user || !notifications) return;

    // Optimistic UI update
    setNotifications((prev) => (prev ? { ...prev, [key]: value } as NotificationPreferences : null));

    try {
      await profileService.updateNotificationPreferences(user.id, key, value);
      toast({
        title: activeLanguage === "en" ? "Preferences Updated" : "प्राथमिकताएं अपडेट",
        description: activeLanguage === "en" ? "Your notification preferences have been saved." : "आपकी अधिसूचना प्राथमिकताएं सहेजी गईं।",
      });
    } catch (error: any) {
      logger.error("Failed to update notification preferences:", error);
      // Rollback
      setNotifications((prev) => (prev ? { ...prev, [key]: !value } as NotificationPreferences : null));
      toast({
        title: activeLanguage === "en" ? "Error" : "त्रुटि",
        description: error.message || "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  return {
    profile,
    setProfile,
    issues,
    notifications,
    loading,
    saving,
    handleProfileUpdate,
    handleNotificationUpdate,
    refetch: fetchData,
  };
}
