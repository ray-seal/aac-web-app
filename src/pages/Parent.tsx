import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export const Parent: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
    // Listen for auth changes (optional, for better UX)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">{mode === 'signup' ? 'Parent Sign Up' : 'Parent Sign In'}</h2>
        <form onSubmit={handleAuth} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="border p-2 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="border p-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Loading...' : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
          </button>
          <button
            type="button"
            className="text-blue-500 underline"
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
          >
            {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Welcome, Parent!</h2>
      <p className="mb-4">You are signed in as <span className="font-mono">{user.email}</span></p>
      <button
        className="bg-gray-500 text-white px-4 py-2 rounded"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Your Favourites</h3>
        {/* Add favourites management UI here */}
        <p>(Feature coming soon!)</p>
      </div>
    </div>
  )
}