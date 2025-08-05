import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { uploadImage, getSignedImageUrl } from '../utils/uploadImage'
import { useNavigate } from 'react-router-dom'

export default function Parent() {
  // Auth and user state
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // PIN lock state
  const [pinInput, setPinInput] = useState('')
  const [pinSetInput, setPinSetInput] = useState('')
  const [pinConfirmInput, setPinConfirmInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSetError, setPinSetError] = useState('')
  const [pinUnlocked, setPinUnlocked] = useState(false)

  // Favourites and uploads
  const [favourites, setFavourites] = useState<any[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: number]: string }>({})
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  const navigate = useNavigate()

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

  // Load user profile (for PIN)
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return setProfile(null)
      const { data } = await supabase
        .from('profiles')
        .select('parent_pin')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    fetchProfile()
  }, [user])

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

  // Whenever favourites load, get all signed URLs for uploads
  useEffect(() => {
    async function loadSignedUrls() {
      const uploads = favourites.filter(f => f.type !== 'aac')
      const urlMap: { [id: number]: string } = {}
      await Promise.all(uploads.map(async (fav) => {
        urlMap[fav.id] = await getSignedImageUrl(fav.image_url)
      }))
      setSignedUrls(urlMap)
    }
    if (favourites.length > 0) loadSignedUrls()
    else setSignedUrls({})
  }, [favourites])

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
    setProfile(null)
    setPinUnlocked(false)
  }

  // Upload handler with label
  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !uploadFile || !uploadLabel) return
    setUploading(true)
    const path = await uploadImage(uploadFile, user.id)
    setUploading(false)
    if (!path) return
    const { error } = await supabase
      .from('favourites')
      .insert([{ user_id: user.id, image_url: path, label: uploadLabel, type: 'upload' }])
    if (!error) {
      setUploadLabel('')
      setUploadFile(null)
      fetchFavourites()
    } else if (error) {
      setError(error.message)
    }
  }

  // Remove favourite
  async function handleRemoveFavourite(favId: number) {
    await supabase.from('favourites').delete().eq('id', favId)
    setFavourites(favourites.filter(f => f.id !== favId))
  }

  // Add AAC symbol to favourites
  async function addAacToFavourites(symbol: AacSymbol) {
    if (!user) return
    const exists = favourites.some(f => f.type === 'aac' && f.label === symbol.text)
    if (exists) return
    const { error } = await supabase
      .from('favourites')
      .insert([{ user_id: user.id, image_url: symbol.imagePath, label: symbol.text, type: 'aac' }])
    if (!error) fetchFavourites()
    else if (error) setError(error.message)
  }

  // PIN: Set PIN
  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault()
    setPinSetError('')
    if (!/^\d{4}$/.test(pinSetInput)) {
      setPinSetError('PIN must be exactly 4 digits')
      return
    }
    if (pinSetInput !== pinConfirmInput) {
      setPinSetError('PINs do not match')
      return
    }
    // Update profile
    const { error } = await supabase
      .from('profiles')
      .update({ parent_pin: pinSetInput })
      .eq('id', user.id)
    if (error) {
      setPinSetError('Failed to set PIN')
      return
    }
    setProfile({ ...profile, parent_pin: pinSetInput })
    setPinUnlocked(true)
  }

  // PIN: Check PIN
  function handleCheckPin(e: React.FormEvent) {
    e.preventDefault()
    setPinError('')
    if (pinInput === profile.parent_pin) {
      setPinUnlocked(true)
      setPinInput('')
    } else {
      setPinError('Incorrect PIN. Please try again.')
      setPinInput('')
    }
  }

  // Render: not logged in
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

  // PIN: Prompt for PIN if set and not unlocked
  if (profile && profile.parent_pin && !pinUnlocked) {
    return (
      <div className="max-w-xs mx-auto mt-20 p-6 bg-white rounded shadow flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Enter Parent PIN</h2>
        <form onSubmit={handleCheckPin} className="flex flex-col gap-3 w-full">
          <input
            type="password"
            pattern="\d{4}"
            inputMode="numeric"
            maxLength={4}
            value={pinInput}
            onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="border p-2 rounded text-center tracking-widest text-xl"
            placeholder="4-digit PIN"
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded"
          >
            Unlock
          </button>
          {pinError && <div className="text-red-600 text-center">{pinError}</div>}
        </form>
      </div>
    )
  }

  // PIN: Prompt to set PIN if none set
  if (profile && !profile.parent_pin) {
    return (
      <div className="max-w-xs mx-auto mt-20 p-6 bg-white rounded shadow flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-2">Set Parent PIN</h2>
        <form onSubmit={handleSetPin} className="flex flex-col gap-3 w-full">
          <input
            type="password"
            pattern="\d{4}"
            inputMode="numeric"
            maxLength={4}
            value={pinSetInput}
            onChange={e => setPinSetInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="border p-2 rounded text-center tracking-widest text-xl"
            placeholder="Choose 4-digit PIN"
            autoFocus
            required
          />
          <input
            type="password"
            pattern="\d{4}"
            inputMode="numeric"
            maxLength={4}
            value={pinConfirmInput}
            onChange={e => setPinConfirmInput(e.target.value.replace(/\D/g, '').slice(0,4))}
            className="border p-2 rounded text-center tracking-widest text-xl"
            placeholder="Confirm 4-digit PIN"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-2 rounded"
          >
            Set PIN
          </button>
          {pinSetError && <div className="text-red-600 text-center">{pinSetError}</div>}
        </form>
      </div>
    )
  }

  // Main Parent content (unlocked)
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => navigate('/')}
          >
            Back
          </button>
          <h2 className="text-2xl font-bold">Welcome, Parent!</h2>
        </div>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      <p className="mb-4">You are signed in as <span className="font-mono">{user.email}</span></p>

      {/* Upload new image */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">Upload new favourite</h3>
        <form onSubmit={handleUploadSubmit} className="flex gap-2 items-end flex-wrap">
          <input
            type="file"
            accept="image/*"
            onChange={e => setUploadFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
            className="border rounded p-2"
            required
          />
          <input
            type="text"
            value={uploadLabel}
            onChange={e => setUploadLabel(e.target.value)}
            placeholder="Label for this image"
            className="border rounded p-2"
            required
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Add'}
          </button>
        </form>
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>

      {/* All AAC symbols with 'add to favourites' */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">All AAC Symbols (add to favourites)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {aacSymbols.map((symbol: AacSymbol) => (
            <div key={symbol.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
              <img
                src={symbol.imagePath}
                alt={symbol.text}
                className="w-16 h-16 object-cover rounded mb-2"
              />
              <div className="text-center text-xs font-medium mb-1">{symbol.text}</div>
              <button
                onClick={() => addAacToFavourites(symbol)}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                disabled={favourites.some(f => f.type === 'aac' && f.label === symbol.text)}
              >
                {favourites.some(f => f.type === 'aac' && f.label === symbol.text) ? 'Added' : 'Add to Favourites'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Favourites grid */}
      <div>
        <h3 className="font-bold mb-2">Your Favourites</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
          {favourites.length === 0 && (
            <p className="col-span-full text-gray-600 text-center">(No favourites yet)</p>
          )}
          {favourites.map((fav: any) => (
            <div key={fav.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
              <img
                src={fav.type === 'aac'
                  ? fav.image_url
                  : (signedUrls[fav.id] || '')}
                alt={fav.label}
                className="w-16 h-16 object-cover rounded mb-2"
                style={{ background: '#E0E7EF' }}
              />
              <div className="text-center text-xs font-medium mb-1">{fav.label}</div>
              <button
                onClick={() => handleRemoveFavourite(fav.id)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}