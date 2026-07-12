import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const finish = async () => {
      // Give the client a tick to hydrate session from hash / storage.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      const intended = sessionStorage.getItem("propa_post_login") || "/app";
      sessionStorage.removeItem("propa_post_login");
      navigate(data.session ? intended : "/login", { replace: true });
    };
    // Small delay to allow lovable helper / hash parsing to complete
    const t = window.setTimeout(finish, 200);
    return () => { cancelled = true; clearTimeout(t); };
  }, [navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        Signing you in…
      </div>
    </div>
  );
}
