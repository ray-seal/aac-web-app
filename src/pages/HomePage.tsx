import { useState, useEffect } from 'react'
import { AACGrid } from '../components/AACGrid'
import { aacSymbols } from '../data/aac-symbols'
import { supabase } from '../supabaseClient'

// Helper to get image URL for uploaded favourites
import { getImageUrl } from '../utils/uploadImage'

export default function HomePage() {
  const [tab, setTab] = useState<'aac' | 'favourites'>('aac')
  const [user, setUser] = useState<any>(null)
  const [favourites, setFavourites] = useState<any[]>([])

  // Auth/user state
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
    if (!user) {
      setFavourites([])
      return
    }
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

  // Handler for speaking text
  function handleSpeak(label: string) {
    const utterance = new SpeechSynthesisUtterance(label)
    window.speechSynthesis.speak(utterance)
  }

  // Favourites grid format (matches AACGrid)
  function renderFavouritesGrid() {
    if (!favourites.length)
      return <div className="p-4 text-center text-gray-500">No favourites yet.</div>
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {favourites.map(fav => (
          <div key={fav.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
            <img
              src={fav.type === 'aac' ? fav.image_url : getImageUrl(fav.image_url)}
              alt={fav.label}
              className="w-16 h-16 object-cover rounded mb-2"
            />
            <div className="text-center text-xs font-medium mb-1">{fav.label}</div>
            <button
              onClick={() => handleSpeak(fav.label)}
              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
            >
              Speak
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="flex gap-4 mb-6">
        <button
          className={tab === 'aac' ? 'font-bold underline' : ''}
          onClick={() => setTab('aac')}
        >
          AAC Symbols
        </button>
        {user && (
          <button
            className={tab === 'favourites' ? 'font-bold underline' : ''}
            onClick={() => setTab('favourites')}
          >
            Favourites
          </button>
        )}
      </div>
      {tab === 'aac' && (
        <AACGrid items={aacSymbols} onSelect={label => handleSpeak(label)} />
      )}
      {tab === 'favourites' && user && renderFavouritesGrid()}
    </div>
  )
}