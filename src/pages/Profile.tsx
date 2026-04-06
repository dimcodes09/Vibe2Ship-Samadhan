import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  FileText,
  Bell,
  MapPin,
  Phone,
  Mail,
  Home,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Clock,
  LogOut
} from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  preferred_language: string | null;
}

interface ReportedIssue {
  id: string;
  title: string;
  category: string;
  location: string | null;
  status: string;
  supports_count: number;
  created_at: string;
}

interface NotificationPreferences {
  id: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  issue_updates: boolean;
  scheme_alerts: boolean;
  document_reminders: boolean;
  weekly_digest: boolean;
}

const statusConfig: Record<string, { label: string; labelHi: string; class: string; icon: React.ReactNode }> = {
  reported: { 
    label: "Reported", 
    labelHi: "रिपोर्ट की गई",
    class: "bg-warning/15 text-warning",
    icon: <AlertTriangle className="w-3 h-3" />
  },
  "in-progress": { 
    label: "In Progress", 
    labelHi: "प्रगति में",
    class: "bg-info/15 text-info",
    icon: <Timer className="w-3 h-3" />
  },
  resolved: { 
    label: "Resolved", 
    labelHi: "हल",
    class: "bg-accent/15 text-accent",
    icon: <CheckCircle2 className="w-3 h-3" />
  },
};

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [issues, setIssues] = useState<ReportedIssue[]>([]);
  const [notifications, setNotifications] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Fetch reported issues
      const { data: issuesData } = await supabase
        .from("reported_issues")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      
      if (issuesData) setIssues(issuesData);

      // Fetch notification preferences
      const { data: notifData } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      
      if (notifData) setNotifications(notifData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          preferred_language: profile.preferred_language,
        })
        .eq("user_id", user!.id);

      if (error) throw error;

      toast({
        title: language === "en" ? "Profile Updated" : "प्रोफ़ाइल अपडेट",
        description: language === "en" ? "Your profile has been saved." : "आपकी प्रोफ़ाइल सहेजी गई।",
      });
    } catch (error: any) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!notifications) return;

    const updated = { ...notifications, [key]: value };
    setNotifications(updated);

    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update({ [key]: value })
        .eq("user_id", user!.id);

      if (error) throw error;

      toast({
        title: language === "en" ? "Preferences Updated" : "प्राथमिकताएं अपडेट",
        description: language === "en" ? "Your notification preferences have been saved." : "आपकी अधिसूचना प्राथमिकताएं सहेजी गईं।",
      });
    } catch (error: any) {
      toast({
        title: language === "en" ? "Error" : "त्रुटि",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {language === "en" ? "My Profile" : "मेरी प्रोफ़ाइल"}
                </h1>
                <p className="text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                {language === "en" ? "Sign Out" : "साइन आउट"}
              </Button>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="gap-2">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === "en" ? "Profile" : "प्रोफ़ाइल"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="issues" className="gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === "en" ? "My Issues" : "मेरी समस्याएं"}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {language === "en" ? "Notifications" : "अधिसूचनाएं"}
                  </span>
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          {language === "en" ? "Full Name" : "पूरा नाम"}
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={profile?.full_name || ""}
                            onChange={(e) => setProfile(p => p ? {...p, full_name: e.target.value} : null)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {language === "en" ? "Phone Number" : "फ़ोन नंबर"}
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profile?.phone || ""}
                            onChange={(e) => setProfile(p => p ? {...p, phone: e.target.value} : null)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        {language === "en" ? "Address" : "पता"}
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={profile?.address || ""}
                          onChange={(e) => setProfile(p => p ? {...p, address: e.target.value} : null)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          {language === "en" ? "City" : "शहर"}
                        </Label>
                        <Input
                          id="city"
                          value={profile?.city || ""}
                          onChange={(e) => setProfile(p => p ? {...p, city: e.target.value} : null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">
                          {language === "en" ? "State" : "राज्य"}
                        </Label>
                        <Input
                          id="state"
                          value={profile?.state || ""}
                          onChange={(e) => setProfile(p => p ? {...p, state: e.target.value} : null)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pincode">
                          {language === "en" ? "Pincode" : "पिनकोड"}
                        </Label>
                        <Input
                          id="pincode"
                          value={profile?.pincode || ""}
                          onChange={(e) => setProfile(p => p ? {...p, pincode: e.target.value} : null)}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving} className="gap-2">
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {language === "en" ? "Saving..." : "सहेजा जा रहा है..."}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {language === "en" ? "Save Changes" : "बदलाव सहेजें"}
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              {/* Issues Tab */}
              <TabsContent value="issues">
                <div className="bg-card rounded-2xl border border-border p-6">
                  {issues.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">
                        {language === "en" ? "No Issues Reported" : "कोई समस्या दर्ज नहीं"}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {language === "en" 
                          ? "You haven't reported any civic issues yet." 
                          : "आपने अभी तक कोई नागरिक समस्या दर्ज नहीं की है।"}
                      </p>
                      <Button onClick={() => navigate("/report")}>
                        {language === "en" ? "Report an Issue" : "समस्या दर्ज करें"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">
                          {language === "en" ? `${issues.length} Issues` : `${issues.length} समस्याएं`}
                        </h3>
                        <Button size="sm" onClick={() => navigate("/report")}>
                          {language === "en" ? "Report New" : "नई रिपोर्ट"}
                        </Button>
                      </div>
                      
                      {issues.map((issue) => {
                        const status = statusConfig[issue.status] || statusConfig.reported;
                        return (
                          <div 
                            key={issue.id}
                            className="p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {issue.category}
                                  </Badge>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${status.class}`}>
                                    {status.icon}
                                    {language === "en" ? status.label : status.labelHi}
                                  </span>
                                </div>
                                <h4 className="font-medium text-foreground mb-1">
                                  {issue.title}
                                </h4>
                                {issue.location && (
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {issue.location}
                                  </p>
                                )}
                              </div>
                              <div className="text-right text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(issue.created_at).toLocaleDateString()}
                                </div>
                                <p className="text-xs mt-1">
                                  {issue.supports_count} {language === "en" ? "supports" : "समर्थन"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      {language === "en" ? "Notification Channels" : "अधिसूचना चैनल"}
                    </h3>
                    <div className="space-y-4">
                      <NotificationToggle
                        label={language === "en" ? "Email Notifications" : "ईमेल अधिसूचनाएं"}
                        description={language === "en" ? "Receive updates via email" : "ईमेल द्वारा अपडेट प्राप्त करें"}
                        checked={notifications?.email_notifications || false}
                        onCheckedChange={(v) => handleNotificationUpdate("email_notifications", v)}
                        icon={<Mail className="w-5 h-5" />}
                      />
                      <NotificationToggle
                        label={language === "en" ? "SMS Notifications" : "SMS अधिसूचनाएं"}
                        description={language === "en" ? "Receive updates via SMS" : "SMS द्वारा अपडेट प्राप्त करें"}
                        checked={notifications?.sms_notifications || false}
                        onCheckedChange={(v) => handleNotificationUpdate("sms_notifications", v)}
                        icon={<Phone className="w-5 h-5" />}
                      />
                      <NotificationToggle
                        label={language === "en" ? "Push Notifications" : "पुश अधिसूचनाएं"}
                        description={language === "en" ? "Receive push notifications in browser" : "ब्राउज़र में पुश अधिसूचनाएं प्राप्त करें"}
                        checked={notifications?.push_notifications || false}
                        onCheckedChange={(v) => handleNotificationUpdate("push_notifications", v)}
                        icon={<Bell className="w-5 h-5" />}
                      />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      {language === "en" ? "Notification Types" : "अधिसूचना प्रकार"}
                    </h3>
                    <div className="space-y-4">
                      <NotificationToggle
                        label={language === "en" ? "Issue Updates" : "समस्या अपडेट"}
                        description={language === "en" ? "Get notified when your issues are updated" : "जब आपकी समस्याएं अपडेट हों तो सूचित करें"}
                        checked={notifications?.issue_updates || false}
                        onCheckedChange={(v) => handleNotificationUpdate("issue_updates", v)}
                      />
                      <NotificationToggle
                        label={language === "en" ? "Scheme Alerts" : "योजना अलर्ट"}
                        description={language === "en" ? "New schemes matching your profile" : "आपकी प्रोफ़ाइल से मेल खाती नई योजनाएं"}
                        checked={notifications?.scheme_alerts || false}
                        onCheckedChange={(v) => handleNotificationUpdate("scheme_alerts", v)}
                      />
                      <NotificationToggle
                        label={language === "en" ? "Document Reminders" : "दस्तावेज़ अनुस्मारक"}
                        description={language === "en" ? "Expiry and renewal reminders" : "समाप्ति और नवीनीकरण अनुस्मारक"}
                        checked={notifications?.document_reminders || false}
                        onCheckedChange={(v) => handleNotificationUpdate("document_reminders", v)}
                      />
                      <NotificationToggle
                        label={language === "en" ? "Weekly Digest" : "साप्ताहिक सारांश"}
                        description={language === "en" ? "Weekly summary of activity in your area" : "आपके क्षेत्र में गतिविधि का साप्ताहिक सारांश"}
                        checked={notifications?.weekly_digest || false}
                        onCheckedChange={(v) => handleNotificationUpdate("weekly_digest", v)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  checked,
  onCheckedChange,
  icon,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
