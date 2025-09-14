import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

/**
 * Returns [user, loading]
 * - If not authenticated, redirects to /auth
 * - While loading, loading=true and user=null
 */
export function useRequireAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate("/auth", { replace: true });
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [navigate]);

  return [user, loading] as const;
}
