import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { uploadImage, getImageUrl } from '../utils/uploadImage'

export const Parent: React.FC = () => {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [favourites, setFavourites] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)

  // Auth logic
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  // Fetch favourites for this user
  useEffect(() => {
    if (!user) return
    fetchFavourites()
    // eslint-disable-next-line
  }, [user])

  async function fetchFavourites() {
    const { data } = await supabase
      .from('favourites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setFavourites(data ?? [])
  }

  // Auth form handler
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
    setFavourites([])
  }

  // Image upload handler
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!user) return
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const path = await uploadImage(file, user.id)
    setUploading(false)
    if (!path) return
    // Add to favourites table
    const { error } = await supabase
      .from('favourites')
      .insert({ user_id: user.id, image_url: path })
    if (!error) {
      fetchFavourites()
    }
  }

  // Remove favourite
  async function handleRemoveFavourite(favId: number) {
    await supabase.from('favourites').delete().eq('id', favId)
    setFavourites(favourites.filter(f => f.id !== favId))
  }

  // Speak image label if you want (add a label field to favourites table if needed)
  function handleSpeak(text: string) {
    const utterance = new window.SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  // --- AUTH UI ---
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

  // --- FAVOURITES UI ---
  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Welcome, Parent!</h2>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      <p className="mb-4">You are signed in as <span className="font-mono">{user.email}</span></p>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Your Favourites</h3>
        <label className="block mb-2">
          <span className="mr-2 font-medium">Add a new image:</span>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          {uploading && <span className="ml-2 text-sm text-gray-500">Uploading...</span>}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {favourites.length === 0 && (
            <p className="col-span-full text-gray-600 text-center">(No favourites yet)</p>
          )}
          {favourites.map(fav => (
            <div key={fav.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
              <img
                src={getImageUrl(fav.image_url)}
                alt="Favourite"
                className="w-24 h-24 object-cover rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSpeak('Favourite image')}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Speak
                </button>
                <button
                  onClick={() => handleRemoveFavourite(fav.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}