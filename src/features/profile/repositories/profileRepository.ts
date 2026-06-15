import { supabase } from "@/integrations/supabase/client";
import { ProfileResponse } from "@/shared/contracts/ProfileResponse";
import { APIError } from "@/shared/errors/errors";

export const profileRepository = {
  async fetchProfile(userId: string): Promise<ProfileResponse> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw new APIError(error.message, undefined, error);
    return data as ProfileResponse;
  },

  async updateProfile(userId: string, profile: Partial<Omit<ProfileResponse, "id" | "user_id" | "created_at" | "updated_at">>): Promise<ProfileResponse> {
    const { data, error } = await supabase
      .from("profiles")
      .update(profile)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new APIError(error.message, undefined, error);
    return data as ProfileResponse;
  },

  async fetchNotificationPreferences(userId: string) {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw new APIError(error.message, undefined, error);
    return data;
  },

  async updateNotificationPreferences(userId: string, key: string, value: boolean) {
    const { data, error } = await supabase
      .from("notification_preferences")
      .update({ [key]: value })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new APIError(error.message, undefined, error);
    return data;
  },
};
