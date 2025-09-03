import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import HowToPage from './pages/howTo'
import Parent from './pages/Parent'
import AuthPage from './pages/AuthPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function ParentOrAuth() {
  const [user, setUser] = useState<any>(undefined);
  const location = useLocation();
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
  }, [location]);
  if (user === undefined) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <AuthPage />;
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
