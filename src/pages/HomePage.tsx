import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { supabase } from '../supabaseClient'
import { getSignedImageUrl } from '../utils/uploadImage'
import { AACGrid } from '../components/AACGrid'

const FAVOURITES_KEY = 'aac_favourites'
const OFFLINE_QUEUE_KEY = 'aac_fav_queue'
function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

type OfflineAction =
  | { type: 'add'; data: any }
  | { type: 'remove'; id: number }
  | { type: 'move'; id: number; direction: 'up' | 'down' }

function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}
function getOfflineQueue(): OfflineAction[] {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
}

export default function HomePage() {
  const [tab, setTab] = useState<'aac' | 'favourites'>('aac')
  const [user, setUser] = useState<any>(null)
  const [favourites, setFavourites] = useState<any[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: number]: string }>({})
  const [selectedSymbols, setSelectedSymbols] = useState<AacSymbol[]>([])

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

  useEffect(() => {
    if (!user) {
      setFavourites([])
      setSignedUrls({})
      return
    }
    fetchFavourites()
  }, [user])

  async function fetchFavourites() {
    if (isOnline()) {
      const { data } = await supabase
        .from('favourites')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
      setFavourites(data ?? [])
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(data ?? []))
    } else {
      const offlineFavs = localStorage.getItem(FAVOURITES_KEY)
      setFavourites(offlineFavs ? JSON.parse(offlineFavs) : [])
    }
  }

  useEffect(() => {
    if (user && favourites.length > 0 && tab !== 'favourites') {
      setTab('favourites')
    }
  }, [favourites, user])

  useEffect(() => {
    async function loadSignedUrls() {
      const uploads = favourites.filter(f => f.type !== 'aac')
      const urlMap: { [id: number]: string } = {}
      await Promise.all(
        uploads.map(async fav => {
          urlMap[fav.id] = await getSignedImageUrl(fav.image_url)
        })
      )
      setSignedUrls(urlMap)
    }
    if (favourites.length > 0) {
      loadSignedUrls()
    } else {
      setSignedUrls({})
    }
  }, [favourites])

  function handleSelectFavourite(fav: any) {
    const imagePath = fav.type === 'aac'
      ? fav.image_url
      : signedUrls[fav.id] || ''
    const symbol: AacSymbol = {
      id: fav.id?.toString() ?? fav.label,
      text: fav.label,
      imagePath,
      category: fav.type ?? 'favourite'
    }
    if (!selectedSymbols.some(s => s.id === symbol.id)) {
      setSelectedSymbols([...selectedSymbols, symbol])
      const utterance = new window.SpeechSynthesisUtterance(symbol.text)
      window.speechSynthesis.speak(utterance)
    }
  }

  function handleSelectSymbol(symbol: AacSymbol) {
    if (!selectedSymbols.some(s => s.id === symbol.id)) {
      setSelectedSymbols([...selectedSymbols, symbol])
      const utterance = new window.SpeechSynthesisUtterance(symbol.text)
      window.speechSynthesis.speak(utterance)
    }
  }

  function handleSpeakSentence() {
    if (!selectedSymbols.length) return
    const utterance = new window.SpeechSynthesisUtterance(
      selectedSymbols.map(s => s.text).join(' ')
    )
    window.speechSynthesis.speak(utterance)
  }

  function handleClearSentence() {
    setSelectedSymbols([])
  }

  // FIX: Prevent duplicate favourites when syncing offline queue
  useEffect(() => {
    if (!user) return
    function syncOfflineQueue() {
      if (!isOnline()) return
      const queue: OfflineAction[] = getOfflineQueue()
      if (!queue.length) return

      Promise.all(queue.map(async action => {
        if (action.type === 'add') {
          const { id, ...toInsert } = action.data
          // Check for duplicate before inserting (label, type, user_id)
          const { data: existing } = await supabase
            .from('favourites')
            .select('*')
            .eq('user_id', toInsert.user_id)
            .eq('label', toInsert.label)
            .eq('type', toInsert.type)
            .single()
          if (!existing) {
            await supabase
              .from('favourites')
              .insert([{ ...toInsert }])
          }
        } else if (action.type === 'remove') {
          await supabase
            .from('favourites')
            .delete()
            .eq('id', action.id)
        }
      })).then(() => {
        clearOfflineQueue()
        fetchFavourites()
      })
    }

    window.addEventListener('online', syncOfflineQueue)
    if (isOnline()) syncOfflineQueue()
    return () => window.removeEventListener('online', syncOfflineQueue)
  }, [user, favourites])

  function renderFavouritesGrid() {
    if (!favourites.length)
      return <div className="p-4 text-center text-gray-500">No favourites yet.</div>
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {favourites.map((fav: any) => (
          <div key={fav.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
            <button
              className="w-full flex flex-col items-center focus:outline-none"
              onClick={() => handleSelectFavourite(fav)}
              type="button"
            >
              <img
                src={fav.type === 'aac' ? fav.image_url : (signedUrls[fav.id] || '')}
                alt={fav.label}
                className="w-16 h-16 object-cover rounded mb-2"
              />
              <div className="text-center text-xs font-medium mb-1">{fav.label}</div>
            </button>
            {/* Remove button is intentionally omitted */}
          </div>
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
          {selectedSymbols.map((symbol, idx) => (
            <span key={idx} className="px-2 py-1 bg-white border rounded flex items-center gap-1">
              <img src={symbol.imagePath} alt={symbol.text} className="w-6 h-6 inline-block" />
              {symbol.text}
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
      {tab === 'aac' && (
        <AACGrid
          items={aacSymbols}
          onSelect={handleSelectSymbol}
        />
      )}
      {tab === 'favourites' && user && renderFavouritesGrid()}
    </div>
  )
}