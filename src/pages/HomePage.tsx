import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { supabase } from '../supabaseClient'
import { getSignedImageUrl } from '../utils/uploadImage'
import { AACGrid } from '../components/AACGrid'

const FAVOURITES_KEY = 'aac_favourites'

function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

// Utility: track offline changes for later sync
const OFFLINE_QUEUE_KEY = 'aac_fav_queue'
function addToOfflineQueue(action: any) {
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
  queue.push(action)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}
function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}
function getOfflineQueue() {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
}

export default function HomePage() {
  const [tab, setTab] = useState<'aac' | 'favourites'>('aac')
  const [user, setUser] = useState<any>(null)
  const [favourites, setFavourites] = useState<any[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: number]: string }>({})

  // Communication box state
  const [selectedSymbols, setSelectedSymbols] = useState<AacSymbol[]>([])

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

  // Fetch favourites for this user, offline support
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
      // Offline: load from localStorage
      const offlineFavs = localStorage.getItem(FAVOURITES_KEY)
      setFavourites(offlineFavs ? JSON.parse(offlineFavs) : [])
    }
  }

  // If user has favourites, show favourites tab by default
  useEffect(() => {
    if (user && favourites.length > 0 && tab !== 'favourites') {
      setTab('favourites')
    }
  }, [favourites, user])

  // Load signed URLs for uploads
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

  // Handler for selecting a symbol from the AAC grid
  function handleSelectSymbol(symbol: AacSymbol) {
    // Only add if not already selected (by id)
    if (!selectedSymbols.some(s => s.id === symbol.id)) {
      setSelectedSymbols([...selectedSymbols, symbol])

      // Text-to-Speech for the pressed symbol
      const utterance = new window.SpeechSynthesisUtterance(symbol.text)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handler for selecting a favourite (convert to AacSymbol)
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
    // Only add if not already selected (by id)
    if (!selectedSymbols.some(s => s.id === symbol.id)) {
      setSelectedSymbols([...selectedSymbols, symbol])

      // Text-to-Speech for the pressed symbol
      const utterance = new window.SpeechSynthesisUtterance(symbol.text)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Handler for speaking the sentence
  function handleSpeakSentence() {
    if (!selectedSymbols.length) return
    const utterance = new window.SpeechSynthesisUtterance(
      selectedSymbols.map(s => s.text).join(' ')
    )
    window.speechSynthesis.speak(utterance)
  }

  // Handler to clear the communication box
  function handleClearSentence() {
    setSelectedSymbols([])
  }

  // Add to favourites (offline and sync support)
  async function handleAddFavourite(symbol: AacSymbol) {
    if (!user) return
    const exists = favourites.some(f => f.type === 'aac' && f.label === symbol.text)
    if (exists) return
    const maxOrder = favourites.length > 0 ? Math.max(...favourites.map(f => f.order ?? 0)) : 0

    if (!isOnline()) {
      // Offline: fake id, queue for sync
      const newFav = {
        id: Date.now(),
        user_id: user.id,
        image_url: symbol.imagePath,
        label: symbol.text,
        type: 'aac',
        order: maxOrder + 1
      }
      const newFavs = [...favourites, newFav]
      setFavourites(newFavs)
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(newFavs))
      addToOfflineQueue({ type: 'add', data: newFav })
      return
    }

    const { error } = await supabase
      .from('favourites')
      .insert([{ user_id: user.id, image_url: symbol.imagePath, label: symbol.text, type: 'aac', order: maxOrder + 1 }])
    if (!error) fetchFavourites()
    else alert(error.message)
  }

  // Remove favourite (offline and sync support)
  async function handleRemoveFavourite(fav: any) {
    if (!isOnline()) {
      const newFavs = favourites.filter(f => f.id !== fav.id)
      setFavourites(newFavs)
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(newFavs))
      addToOfflineQueue({ type: 'remove', id: fav.id })
      return
    }
    await supabase.from('favourites').delete().eq('id', fav.id)
    fetchFavourites()
  }

  // Move favourite up/down (offline and sync support)
  async function handleMoveFavourite(favId: number, direction: 'up' | 'down') {
    const idx = favourites.findIndex(f => f.id === favId)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= favourites.length) return

    const fav = favourites[idx]
    const targetFav = favourites[targetIdx]
    const updated = [...favourites]
    updated[idx] = targetFav
    updated[targetIdx] = fav
    [updated[idx].order, updated[targetIdx].order] = [updated[targetIdx].order, updated[idx].order]

    if (!isOnline()) {
      setFavourites(updated)
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated))
      addToOfflineQueue({ type: 'move', id: fav.id, direction })
      return
    }

    await supabase
      .from('favourites')
      .update({ order: targetFav.order })
      .eq('id', fav.id)
    await supabase
      .from('favourites')
      .update({ order: fav.order })
      .eq('id', targetFav.id)
    fetchFavourites()
  }

  // Sync local offline changes to Supabase when back online
  useEffect(() => {
    if (!user) return
    function syncOfflineQueue() {
      if (!isOnline()) return
      const queue = getOfflineQueue()
      if (!queue.length) return

      // For each queued action, perform it online
      Promise.all(queue.map(async action => {
        if (action.type === 'add') {
          // Remove fake id before insert
          const { id, ...toInsert } = action.data
          await supabase
            .from('favourites')
            .insert([{ ...toInsert }])
        } else if (action.type === 'remove') {
          await supabase
            .from('favourites')
            .delete()
            .eq('id', action.id)
        } else if (action.type === 'move') {
          // Find fav and target, swap order
          const favs = [...favourites]
          const idx = favs.findIndex(f => f.id === action.id)
          const targetIdx = action.direction === 'up' ? idx - 1 : idx + 1
          if (idx === -1 || targetIdx < 0 || targetIdx >= favs.length) return
          const fav = favs[idx]
          const targetFav = favs[targetIdx]
          await supabase
            .from('favourites')
            .update({ order: targetFav.order })
            .eq('id', fav.id)
          await supabase
            .from('favourites')
            .update({ order: fav.order })
            .eq('id', targetFav.id)
        }
      })).then(() => {
        clearOfflineQueue()
        fetchFavourites()
      })
    }

    window.addEventListener('online', syncOfflineQueue)
    // Also sync immediately if online on mount
    if (isOnline()) syncOfflineQueue()
    return () => window.removeEventListener('online', syncOfflineQueue)
  }, [user, favourites])

  // Favourites grid: clicking adds to communication box just like AAC symbols
  function renderFavouritesGrid() {
    if (!favourites.length)
      return <div className="p-4 text-center text-gray-500">No favourites yet.</div>
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {favourites.map((fav: any, idx) => (
          <div
            key={fav.id}
            className="border rounded p-2 flex flex-col items-center bg-gray-50"
          >
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
            <div className="flex gap-1 mt-2">
              <button
                disabled={idx === 0}
                onClick={() => handleMoveFavourite(fav.id, 'up')}
                className="px-1 py-0 bg-blue-400 text-white rounded text-xs"
                title="Move up"
              >↑</button>
              <button
                disabled={idx === favourites.length - 1}
                onClick={() => handleMoveFavourite(fav.id, 'down')}
                className="px-1 py-0 bg-blue-400 text-white rounded text-xs"
                title="Move down"
              >↓</button>
              <button
                onClick={() => handleRemoveFavourite(fav)}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs ml-1"
              >
                Remove
              </button>
            </div>
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
          onSelect={handleAddFavourite}
        />
      )}
      {tab === 'favourites' && user && renderFavouritesGrid()}
    </div>
  )
}
