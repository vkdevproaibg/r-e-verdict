import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SessionCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  ensureAgent: () => Promise<string | null>;
}

const Ctx = createContext<SessionCtx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener first (avoid missed events)
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const ensureAgent = useCallback(async (): Promise<string | null> => {
    const user = session?.user;
    if (!user) return null;
    const { data: existing } = await supabase
      .from("agents")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing?.id) return existing.id;
    const { data: created, error } = await supabase
      .from("agents")
      .insert({
        user_id: user.id,
        contact_email: user.email ?? null,
        name: (user.user_metadata?.full_name as string) ?? null,
      })
      .select("id")
      .single();
    if (error) {
      console.warn("ensureAgent failed", error);
      return null;
    }
    return created.id;
  }, [session]);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading, signOut, ensureAgent }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used inside SessionProvider");
  return v;
}
