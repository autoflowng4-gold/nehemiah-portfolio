import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
const AuthContext = createContext<{ user: User | null; loading: boolean; recovery: boolean }>({
  user: null,
  loading: true,
  recovery: false,
});
export const usePortfolioAuth = () => useContext(AuthContext);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    try {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
        if (event === "PASSWORD_RECOVERY") setRecovery(true);
        if (event === "SIGNED_OUT" || event === "USER_UPDATED") setRecovery(false);
      });
      supabase.auth.getSession().then(({ data, error }) => {
        if (!error) setUser(data.session?.user ?? null);
        setLoading(false);
      });
      return () => data.subscription.unsubscribe();
    } catch (err) {
      // Supabase isn't configured yet (e.g. env vars not set). Don't crash
      // the whole app — just treat the visitor as signed out.
      console.error("[AuthProvider] Supabase unavailable:", err);
      setLoading(false);
      return undefined;
    }
  }, []);
  return (
    <AuthContext.Provider value={{ user, loading, recovery }}>{children}</AuthContext.Provider>
  );
}
