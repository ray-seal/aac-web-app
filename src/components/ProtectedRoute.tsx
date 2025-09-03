import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(undefined);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (user === undefined) {
    return <div className="text-center mt-10">Loading...</div>;
  }
  if (!user) {
    // If not logged in, show nothing (App will render AuthPage)
    return null;
  }
  return <>{children}</>;
}
