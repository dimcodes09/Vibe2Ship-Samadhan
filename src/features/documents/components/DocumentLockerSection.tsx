import { useRef } from "react";
import { Button } from "@/shared/components/ui/button";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { useDocuments } from "../hooks/useDocuments";
import { LoadingState } from "@/shared/components/LoadingState";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { useToast } from "@/shared/hooks/use-toast";
import { 
  FolderLock, 
  Upload, 
  Shield, 
  Bell,
  FileText,
  Lock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Loader2,
  CreditCard,
  Home
} from "lucide-react";

export function DocumentLockerSection() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    lockerDetails, 
    loading, 
    error, 
    uploadStep, 
    uploadProgress, 
    uploadDocument, 
    deleteDocument, 
    getDownloadUrl 
  } = useDocuments();

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: t("documents.bankGrade"),
      description: t("documents.bankDesc"),
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("documents.autoTagging"),
      description: t("documents.autoDesc"),
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: t("documents.expiryReminders"),
      description: t("documents.expiryDesc"),
    },
    {
      icon: <Upload className="w-6 h-6" />,
      title: t("documents.quickReuse"),
      description: t("documents.reuseDesc"),
    },
  ];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Standard client validation
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only PDF, JPEG, PNG, or WebP files are accepted.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be under 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadDocument(file);
      toast({
        title: "Document Saved",
        description: "Your document was uploaded and successfully analyzed by Gemini AI.",
      });
    } catch (err: any) {
      toast({
        title: "Upload Failed",
        description: err.message || "Failed to process and upload the document.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePreview = async (filePath: string) => {
    try {
      const url = await getDownloadUrl(filePath);
      window.open(url, "_blank");
    } catch (err) {
      toast({
        title: "Preview Error",
        description: "Could not retrieve secure download link.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, filePath: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering preview
    if (!confirm("Are you sure you want to delete this document from your secure locker?")) {
      return;
    }
    try {
      await deleteDocument(id, filePath);
      toast({
        title: "Document Deleted",
        description: "The document has been removed from your locker.",
      });
    } catch (err) {
      toast({
        title: "Deletion Error",
        description: "Failed to remove the document.",
        variant: "destructive",
      });
    }
  };

  const getDocumentIcon = (type?: string) => {
    switch (type) {
      case "aadhaar":
      case "pan":
        return <CreditCard className="w-5 h-5 text-primary" />;
      case "license":
        return <Shield className="w-5 h-5 text-primary" />;
      case "property":
        return <Home className="w-5 h-5 text-primary" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <section id="documents" className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <FolderLock className="w-4 h-4" />
              {t("documents.badge")}
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t("documents.title")}{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-glow">{t("documents.locker")}</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              {t("documents.subtitle")}
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-0.5">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
              <Lock className="w-5 h-5" />
              {t("documents.openLocker")}
            </Button>
          </div>

          {/* Right - Document Preview */}
          <div className="relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
              accept="application/pdf,image/jpeg,image/png,image/webp" 
            />

            <div className="bg-card rounded-3xl border border-border shadow-xl p-6 sm:p-8 relative min-h-[350px] flex flex-col justify-between overflow-hidden">
              {/* Visible AI Loading and Processing Overlay */}
              {uploadStep !== "idle" && (
                <div className="absolute inset-0 bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-50">
                  <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                    <Loader2 className="w-20 h-20 text-primary animate-spin absolute" />
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-2">
                    {uploadStep === "uploading" && "Uploading to Secure Locker..."}
                    {uploadStep === "analyzing" && "Gemini AI Analyzing Document..."}
                    {uploadStep === "saving" && "Cataloging Structured Metadata..."}
                    {uploadStep === "complete" && "Locker Updated!"}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-4 max-w-[280px]">
                    {uploadStep === "analyzing" && "Gemini is performing OCR, identifying document type, and extracting form fields."}
                    {uploadStep === "saving" && "Storing values in encrypted ledger."}
                  </p>
                  <div className="w-48 bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-primary mt-2">{uploadProgress}%</span>
                </div>
              )}

              {loading ? (
                <LoadingState message="Connecting to encrypted document locker..." />
              ) : error ? (
                <ErrorState message={error} />
              ) : !lockerDetails ? (
                <EmptyState title="No Locker Access" description="Your secure locker could not be initialized." />
              ) : (
                <>
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <FolderLock className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-foreground">{t("documents.myDocuments")}</h4>
                          <p className="text-sm text-muted-foreground">
                            {lockerDetails.totalFiles} files • {lockerDetails.totalSizeMb} MB used
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadStep !== "idle"}>
                        <Upload className="w-4 h-4" />
                        {t("documents.upload")}
                      </Button>
                    </div>

                    {/* Document List */}
                    {lockerDetails.documents.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                        <FileText className="w-10 h-10 text-muted-foreground/60" />
                        <p className="font-medium text-sm">No documents in your locker yet</p>
                        <p className="text-xs">Upload your Aadhaar Card, PAN Card, or Property files to begin.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {lockerDetails.documents.map((doc, index) => (
                          <div 
                            key={doc.id || index}
                            onClick={() => doc.file_path && handlePreview(doc.file_path)}
                            className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                                {getDocumentIcon(doc.document_type)}
                              </div>
                              <span className="font-medium text-foreground truncate text-left">{doc.name}</span>
                            </div>
                            
                            <div className="flex items-center gap-3 shrink-0">
                              {doc.status === "verified" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  {t("documents.verified")}
                                </span>
                              )}
                              {doc.status === "expires_soon" && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                                  <Bell className="w-3.5 h-3.5 animate-bounce" />
                                  {t("documents.expiresSoon")}
                                </span>
                              )}
                              
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
                                  onClick={(e) => { e.stopPropagation(); doc.file_path && handlePreview(doc.file_path); }}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive"
                                  onClick={(e) => doc.id && doc.file_path && handleDelete(doc.id, doc.file_path, e)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Quick Tip */}
              <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20 text-left">
                <p className="text-sm text-foreground">
                  <span className="font-medium">💡 {t("documents.tip")}</span>{" "}
                  {t("documents.tipText")}
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-float">
              <Shield className="w-5 h-5" />
              <span className="font-medium">{t("documents.encrypted")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
