import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import HowToPage from './pages/howTo'
import Parent from './pages/Parent'
import AuthPage from './pages/AuthPage'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function ParentOrAuth() {
  const [user, setUser] = useState<any>(undefined);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) setAuthError(error.message);
        if (mounted) setUser(data.user ?? null);
      } catch (e) {
        setAuthError(String(e));
        if (mounted) setUser(null);
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      unsubscribe = () => listener?.subscription?.unsubscribe?.();
    })();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    // If there is an auth error or not authenticated, redirect to /auth
    if (authError || user === null) {
      navigate("/auth", { replace: true });
    }
  }, [authError, user, navigate]);

  if (user === undefined) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return null; // Show nothing while redirecting
  return <Parent />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/parent" element={<ParentOrAuth />} />
        <Route path="/how-to" element={<HowToPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}

export default App
