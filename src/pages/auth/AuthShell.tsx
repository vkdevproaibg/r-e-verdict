import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import heroInterior from "@/assets/hero-interior.jpg";

export function AuthShell({
  mode,
  onSubmit,
}: {
  mode: "signin" | "signup";
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(t("auth.comingSoon"));
    onSubmit();
  };

  const goGuest = () => navigate("/app/analyze");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left form */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5 lg:p-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            {t("brand.name")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle compact />
            <ThemeToggle />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex items-center px-6 lg:px-16 pb-12"
        >
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t(mode === "signin" ? "auth.signInTitle" : "auth.signUpTitle")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(mode === "signin" ? "auth.signInSub" : "auth.signUpSub")}
            </p>

            <Button
              onClick={() => toast.info(t("auth.comingSoon"))}
              variant="outline"
              className="w-full h-11 rounded-xl mt-6 font-medium"
            >
              <GoogleIcon className="h-4 w-4 mr-2" />
              {t("auth.google")}
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {t("auth.or")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("auth.name")}
                  </Label>
                  <Input id="name" type="text" required className="h-11 rounded-xl" />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("auth.email")}
                </Label>
                <Input id="email" type="email" required autoComplete="email" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("auth.password")}
                </Label>
                <Input id="password" type="password" required minLength={6} autoComplete={mode === "signin" ? "current-password" : "new-password"} className="h-11 rounded-xl" />
              </div>
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium mt-2"
              >
                {t(mode === "signin" ? "nav.signIn" : "nav.signUp")}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border text-center">
              <Button
                onClick={goGuest}
                variant="ghost"
                className="text-sm font-medium hover:bg-secondary"
              >
                {t("auth.guestCta")} →
              </Button>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {t("auth.guestHint")}
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t(mode === "signin" ? "auth.noAccount" : "auth.haveAccount")}{" "}
              <Link
                to={mode === "signin" ? "/signup" : "/login"}
                className="text-foreground font-medium hover:text-accent transition-colors"
              >
                {t(mode === "signin" ? "nav.signUp" : "nav.signIn")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right visual */}
      <div className="hidden lg:block relative">
        <img
          src={heroInterior}
          alt="Premium real estate"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-background/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 max-w-md">
          <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-border p-6 shadow-elevated">
            <div className="text-[10px] uppercase tracking-widest text-verdict-green font-semibold inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-verdict-green" />
              Strong buy · 87/100
            </div>
            <div className="mt-2 text-lg font-semibold tracking-tight leading-tight">
              "Saved me from a bad deal in three minutes."
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              — Sample agent testimonial
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
