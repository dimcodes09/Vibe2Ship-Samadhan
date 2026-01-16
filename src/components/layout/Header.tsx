import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Menu, 
  X, 
  Globe, 
  Mic, 
  Bell, 
  User,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  FolderLock,
  LogIn
} from "lucide-react";

const navItems = [
  { labelKey: "nav.dashboard", href: "/dashboard", icon: MapPin },
  { labelKey: "nav.report", href: "/report", icon: FileText },
  { labelKey: "nav.schemes", href: "/schemes", icon: Shield },
  { labelKey: "nav.analyzer", href: "/analyzer", icon: MessageSquare },
  { labelKey: "nav.documents", href: "/documents", icon: FolderLock },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl civic-gradient flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-lg">स</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-foreground">Samadhan</h1>
              <p className="text-[10px] text-muted-foreground -mt-1">समाधान</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.labelKey}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {t(item.labelKey)}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-2"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">
                {language === "en" ? "हिंदी" : "English"}
              </span>
            </Button>

            {/* Voice Assistant */}
            <Button variant="voice" size="iconSm" className="hidden sm:flex">
              <Mic className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="iconSm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* Sign In Button */}
            <Link to="/signin">
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <LogIn className="w-4 h-4" />
                {t("nav.signin")}
              </Button>
            </Link>

            {/* User Menu */}
            <Button variant="ghost" size="iconSm" className="sm:hidden">
              <User className="w-4 h-4" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="iconSm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.labelKey}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {t(item.labelKey)}
                </Link>
              ))}
              
              {/* Auth Links */}
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <Link
                  to="/signin"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  {t("nav.signin")}
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  {t("nav.signup")}
                </Link>
              </div>
              
              <div className="mt-2 pt-2 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={toggleLanguage}
                  className="w-full justify-start gap-3"
                >
                  <Globe className="w-5 h-5" />
                  {language === "en" ? "हिंदी में बदलें" : "Switch to English"}
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
