import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/sections/Footer";
import { BackgroundPattern } from "@/components/BackgroundPattern";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Trash2, Loader2, ShieldAlert } from "lucide-react";

type Issue = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  status: string;
  image_urls: string[] | null;
  created_at: string;
  user_id: string;
  supports_count: number | null;
};

const STATUSES = ["reported", "in_progress", "resolved", "rejected"];

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      if (data) await loadIssues();
      setLoading(false);
    })();
  }, [user, authLoading]);

  const loadIssues = async () => {
    const { data, error } = await supabase
      .from("reported_issues")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setIssues(data as Issue[]);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reported_issues").update({ status }).eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    toast({ title: "Status updated" });
  };

  const deleteIssue = async (id: string) => {
    if (!confirm("Delete this issue?")) return;
    const { error } = await supabase.from("reported_issues").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    setIssues((prev) => prev.filter((i) => i.id !== id));
    toast({ title: "Issue deleted" });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background relative">
        <BackgroundPattern />
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-md text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You need admin privileges to view this page.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              To grant admin access, run this in the backend SQL editor:
              <br />
              <code className="bg-muted px-2 py-1 rounded text-xs">
                INSERT INTO user_roles (user_id, role) VALUES ('{user?.id}', 'admin');
              </code>
            </p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundPattern />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage all reported civic issues</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {STATUSES.map((s) => (
              <div key={s} className="bg-card border rounded-xl p-4">
                <p className="text-sm text-muted-foreground capitalize">{s.replace("_", " ")}</p>
                <p className="text-2xl font-bold">{issues.filter((i) => i.status === s).length}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {issues.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No issues reported yet.</p>
            )}
            {issues.map((issue) => (
              <div key={issue.id} className="bg-card border rounded-xl p-5 flex flex-col md:flex-row gap-4">
                {issue.image_urls?.[0] && (
                  <img src={issue.image_urls[0]} alt="" className="w-full md:w-32 h-32 object-cover rounded-lg" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{issue.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {issue.category} · {issue.location} · {new Date(issue.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{issue.supports_count || 0} supports</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{issue.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select value={issue.status} onValueChange={(v) => updateStatus(issue.id, v)}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="destructive" size="sm" onClick={() => deleteIssue(issue.id)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
