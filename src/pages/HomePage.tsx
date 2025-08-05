import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aacSymbols } from '../data/aac-symbols'
import { supabase } from '../supabaseClient'
import { getImageUrl } from '../utils/uploadImage'

export default function HomePage() {
  const [tab, setTab] = useState<'aac' | 'favourites'>('aac')
  const [user, setUser] = useState<any>(null)
  const [favourites, setFavourites] = useState<any[]>([])

  // Communication box state
  const [selectedSymbols, setSelectedSymbols] = useState<any[]>([])

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

  // Handler for selecting a symbol from the AAC grid
  function handleSelectSymbol(symbol: any) {
    setSelectedSymbols([...selectedSymbols, symbol])
  }

  // Handler for speaking the sentence
  function handleSpeakSentence() {
    if (!selectedSymbols.length) return
    const utterance = new window.SpeechSynthesisUtterance(
      selectedSymbols.map(s => s.label).join(' ')
    )
    window.speechSynthesis.speak(utterance)
  }

  // Handler to clear the communication box
  function handleClearSentence() {
    setSelectedSymbols([])
  }

  // Handler for speaking a single symbol in Favourites
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
        {favourites.map((fav: any) => (
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

  // AAC grid for homepage: clicking adds to communication box
  function renderAACGrid() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {aacSymbols.map((symbol: any, idx: number) => (
          <button
            key={symbol.label + idx}
            className="border rounded p-2 flex flex-col items-center bg-gray-50 hover:bg-blue-100 transition"
            onClick={() => handleSelectSymbol(symbol)}
            type="button"
          >
            <img
              src={symbol.image}
              alt={symbol.label}
              className="w-16 h-16 object-cover rounded mb-2"
            />
            <div className="text-center text-xs font-medium">{symbol.label}</div>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      {/* Parent Link */}
      <div className="mb-4 flex justify-end">
        <Link to="/parent" className="text-blue-500 underline">Parent</Link>
      </div>

      {/* Communication Box */}
      <div className="mb-6 p-4 border rounded bg-gray-100 flex items-center">
        <div className="flex gap-2 flex-wrap">
          {selectedSymbols.map((symbol: any, idx: number) => (
            <span key={idx} className="px-2 py-1 bg-white border rounded flex items-center gap-1">
              <img src={symbol.image} alt={symbol.label} className="w-6 h-6 inline-block" />
              {symbol.label}
            </span>
          ))}
        </div>
        <button
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={handleSpeakSentence}
          disabled={selectedSymbols.length === 0}
        >
          Speak
        </button>
        <button
          className="ml-2 px-3 py-1 bg-gray-400 text-white rounded"
          onClick={handleClearSentence}
          disabled={selectedSymbols.length === 0}
        >
          Clear
        </button>
      </div>

      {/* Tabs */}
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
      {tab === 'aac' && renderAACGrid()}
      {tab === 'favourites' && user && renderFavouritesGrid()}
    </div>
  )
}