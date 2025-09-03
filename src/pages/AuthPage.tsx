import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<"sign-in" | "sign-up">("sign-in");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (view === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
    }
  }

  return (
    <div className="flex flex-col items-center mt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-xs bg-white p-6 rounded shadow">
        <h2 className="mb-4 text-xl font-bold">{view === "sign-in" ? "Sign In" : "Sign Up"}</h2>
        <input
          type="email"
          className="border rounded p-2 w-full mb-2"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="border rounded p-2 w-full mb-4"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          {view === "sign-in" ? "Sign In" : "Sign Up"}
        </button>
        <div className="mt-2 text-sm">
          {view === "sign-in" ? (
            <>
              Don't have an account?{" "}
              <button type="button" className="text-blue-500 underline" onClick={() => setView("sign-up")}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" className="text-blue-500 underline" onClick={() => setView("sign-in")}>
                Sign In
              </button>
            </>
          )}
        </div>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </form>
    </div>
  );
}
