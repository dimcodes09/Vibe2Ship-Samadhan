import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useAuth } from "@/features/auth";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Shield, Trash2, Loader2, ShieldAlert } from "lucide-react";
import { STATUSES, STATUS_LABELS } from "@/shared/constants/statuses";
import { ROUTES } from "@/shared/config/routes";
import { LoadingState } from "@/shared/components/LoadingState";
import { EmptyState } from "@/shared/components/EmptyState";

const statusesList = [STATUSES.REPORTED, STATUSES.IN_PROGRESS, STATUSES.RESOLVED, STATUSES.REJECTED];

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const {
    isAdmin,
    issues,
    loading,
    updateStatus,
    deleteIssue,
  } = useAdminDashboard(user, authLoading, language);

  const handleDelete = async (id: string) => {
    const confirmText = language === "en" ? "Delete this issue?" : "क्या आप इस समस्या को हटाना चाहते हैं?";
    if (!confirm(confirmText)) return;
    await deleteIssue(id);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message={language === "en" ? "Loading admin data..." : "प्रशासक डेटा लोड हो रहा है..."} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 max-w-md text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          {language === "en" ? "Access Denied" : "पहुंच अस्वीकृत"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {language === "en" 
            ? "You need admin privileges to view this page." 
            : "इस पृष्ठ को देखने के लिए आपके पास व्यवस्थापक विशेषाधिकार होने चाहिए।"}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          To grant admin access, run this in the backend SQL editor:
          <br />
          <code className="bg-muted px-2 py-1 rounded text-xs">
            INSERT INTO user_roles (user_id, role) VALUES ('{user?.id}', 'admin');
          </code>
        </p>
        <Button onClick={() => navigate(ROUTES.DASHBOARD)}>
          {language === "en" ? "Back to Dashboard" : "डैशबोर्ड पर वापस जाएं"}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">
            {language === "en" ? "Admin Dashboard" : "प्रशासक डैशबोर्ड"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en" ? "Manage all reported civic issues" : "सभी रिपोर्ट की गई नागरिक समस्याओं का प्रबंधन करें"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statusesList.map((s) => {
          const count = issues.filter((i) => i.status === s).length;
          const label = STATUS_LABELS[s]?.[language] || s;
          return (
            <div key={s} className="bg-card border border-border rounded-xl p-4 shadow-card">
              <p className="text-sm text-muted-foreground capitalize">{label}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        {issues.length === 0 && (
          <EmptyState
            title={language === "en" ? "No Issues Reported" : "कोई समस्या दर्ज नहीं"}
            description={
              language === "en" 
                ? "No citizen issues have been reported in the system yet." 
                : "सिस्टम में अभी तक कोई नागरिक समस्या दर्ज नहीं की गई है।"
            }
          />
        )}
        {issues.map((issue) => (
          <div key={issue.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row gap-4 shadow-card hover:shadow-md transition-shadow">
            {issue.imageUrls?.[0] && (
              <img src={issue.imageUrls[0]} alt="" className="w-full md:w-32 h-32 object-cover rounded-lg" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{issue.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {issue.category} · {issue.location} · {new Date(issue.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary">
                  {issue.supportsCount} {language === "en" ? "supports" : "समर्थन"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={issue.status} onValueChange={(v) => updateStatus(issue.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statusesList.map((s) => {
                      const label = STATUS_LABELS[s]?.[language] || s;
                      return (
                        <SelectItem key={s} value={s} className="capitalize">{label}</SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(issue.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  {language === "en" ? "Delete" : "हटाएं"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
