import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getSignedImageUrl } from '../utils/uploadImage'
import { aacSymbols } from '../data/aac-symbols'

const TAB_PREFS_KEY = 'aac_tab_prefs'

function isOnline() {
  return window.navigator.onLine
}

type HomeSchoolSymbol = {
  id: string | number
  user_id?: string
  image_url: string
  label: string
  type: 'aac' | 'upload'
  order: number
  home?: boolean
  school?: boolean
}

type TabPrefs = { all_tab: boolean; home: boolean; school: boolean }

function guestSymbolsFromAac(): HomeSchoolSymbol[] {
  return aacSymbols.map((sym, idx) => ({
    id: sym.id,
    image_url: sym.imagePath,
    label: sym.text,
    type: 'aac',
    order: idx,
    home: true,
    school: true,
  }))
}

async function cacheUserImages(symbols: HomeSchoolSymbol[], signedUrls: { [id: string]: string }) {
  const cache: { [id: string]: string } = JSON.parse(localStorage.getItem('user_image_cache') || '{}');
  let updated = false;
  for (const sym of symbols) {
    if (sym.type === 'upload' && sym.image_url) {
      const imgUrl = signedUrls[String(sym.id)] || sym.image_url;
      if (!cache[sym.id]) {
        try {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          cache[sym.id] = dataUrl;
          updated = true;
        } catch (err) {
          // Ignore
        }
      }
    }
  }
  if (updated) {
    localStorage.setItem('user_image_cache', JSON.stringify(cache));
  }
}

function getSymbolImgSrc(sym: HomeSchoolSymbol, signedUrls: { [id: string]: string }) {
  if (sym.type === 'aac') return sym.image_url;
  const cache = JSON.parse(localStorage.getItem('user_image_cache') || '{}');
  if (!window.navigator.onLine && cache[sym.id]) return cache[sym.id];
  return signedUrls[String(sym.id)] || sym.image_url;
}

export default function HomePage() {
  const [tab, setTab] = useState<'all' | 'home' | 'school'>('all')
  const [user, setUser] = useState<any>(null)
  const [symbols, setSymbols] = useState<HomeSchoolSymbol[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: string]: string }>({})
  const [tabPrefs, setTabPrefs] = useState<TabPrefs>({ all_tab: true, home: true, school: true })
  const [panel, setPanel] = useState<HomeSchoolSymbol[]>([])
  const [isGuest, setIsGuest] = useState(false)
  const [loadingPrefs, setLoadingPrefs] = useState(false)

  // Tab prefs effect: localStorage only, no Supabase
  useEffect(() => {
    setLoadingPrefs(true)
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setIsGuest(true)
        setUser(null)
        setSymbols(guestSymbolsFromAac())
        setTab('all')
        setTabPrefs({ all_tab: true, home: false, school: false })
        setLoadingPrefs(false)
        return
      }
      setUser(data.user)
      setIsGuest(false)
      const cached = localStorage.getItem(TAB_PREFS_KEY)
      if (cached) {
        setTabPrefs(JSON.parse(cached))
      } else {
        setTabPrefs({ all_tab: true, home: true, school: true })
        localStorage.setItem(TAB_PREFS_KEY, JSON.stringify({ all_tab: true, home: true, school: true }))
      }
      setLoadingPrefs(false)
    })
  }, [])

  useEffect(() => {
    if (isGuest) return
    if (!user) {
      setSymbols([])
      setSignedUrls({})
      return
    }
    fetchSymbols()
    // eslint-disable-next-line
  }, [user, isGuest])

  async function fetchSymbols() {
    if (isOnline()) {
      const { data } = await supabase
        .from('homeschool')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
      setSymbols(data ?? [])
      localStorage.setItem('aac_homeschool', JSON.stringify(data ?? []))
    } else {
      const offline = localStorage.getItem('aac_homeschool')
      setSymbols(offline ? JSON.parse(offline) : [])
    }
  }

  useEffect(() => {
    async function loadSignedUrlsAndCache() {
      const uploads = symbols.filter(f => f.type !== 'aac')
      const urlMap: { [id: string]: string } = {}
      await Promise.all(
        uploads.map(async sym => {
          urlMap[String(sym.id)] = await getSignedImageUrl(sym.image_url)
        })
      )
      setSignedUrls(urlMap)
      if (isOnline()) {
        await cacheUserImages(symbols, urlMap)
      }
    }
    if (!isGuest && symbols.length > 0) {
      loadSignedUrlsAndCache()
    } else {
      setSignedUrls({})
    }
  }, [symbols, isGuest])

  const enabledTabs = isGuest
    ? [{ key: 'all', label: 'All' }]
    : [
        tabPrefs.all_tab && { key: 'all', label: 'All' },
        tabPrefs.home && { key: 'home', label: 'Home' },
        tabPrefs.school && { key: 'school', label: 'School' },
      ].filter(Boolean) as { key: 'all' | 'home' | 'school'; label: string }[]

  useEffect(() => {
    if (!enabledTabs.find(t => t.key === tab)) {
      const first = enabledTabs[0]?.key || 'all'
      setTab(first as 'all' | 'home' | 'school')
    }
  }, [tabPrefs, enabledTabs])

  const filtered = tab === 'all'
    ? symbols
    : tab === 'home'
      ? symbols.filter(s => s.home)
      : symbols.filter(s => s.school)

  function handleSymbolClick(sym: HomeSchoolSymbol) {
    if (panel.some(s => s.id === sym.id)) return
    setPanel(prev => [...prev, sym])
  }
  function handlePanelRemove(idx: number) {
    setPanel(prev => prev.filter((_, i) => i !== idx))
  }
  function handlePanelClear() {
    setPanel([])
  }
  function handleSpeak() {
    if ('speechSynthesis' in window && panel.length) {
      const utter = new window.SpeechSynthesisUtterance(
        panel.map(s => s.label).join(' ')
      )
      window.speechSynthesis.speak(utter)
    }
  }

  function renderSymbolsGrid() {
    if (!filtered.length)
      return <div className="p-4 text-center text-gray-500">No symbols yet.</div>
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filtered.map((sym: any) => {
          const isSelected = panel.some(s => s.id === sym.id)
          return (
            <button
              key={sym.id}
              className={`border rounded p-2 flex flex-col items-center bg-gray-50 transition ${isSelected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
              onClick={() => handleSymbolClick(sym)}
              aria-label={`Add ${sym.label} to communication panel`}
              type="button"
              disabled={isSelected}
            >
              <img
                src={getSymbolImgSrc(sym, signedUrls)}
                alt={sym.label}
                className="w-16 h-16 object-cover rounded mb-2"
              />
              <div className="text-center text-xs font-medium mb-1">{sym.label}</div>
            </button>
          )
        })}
      </div>
    )
  }

  function renderPanel() {
    return (
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 min-h-[64px] bg-gray-100 p-2 rounded">
          {panel.length === 0 && (
            <span className="text-gray-400 text-sm">Tap symbols to build your message.</span>
          )}
          {panel.map((sym, idx) => (
            <div key={idx} className="flex flex-col items-center relative">
              <button
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                type="button"
                aria-label="Remove symbol"
                onClick={() => handlePanelRemove(idx)}
              >×</button>
              <img
                src={getSymbolImgSrc(sym, signedUrls)}
                alt={sym.label}
                className="w-10 h-10 object-cover rounded"
              />
              <span className="text-xs">{sym.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleSpeak}
            disabled={panel.length === 0}
          >
            Speak
          </button>
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handlePanelClear}
            disabled={panel.length === 0}
          >
            Clear
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="mb-4 flex justify-end">
        <Link to="/parent" className="text-blue-500 underline">Parent</Link>
      </div>
      {loadingPrefs ? (
        <div className="text-center text-gray-500 my-10">
          Loading preferences...
        </div>
      ) : (
        <>
          {renderPanel()}
          <div className="flex gap-4 mb-6 justify-center">
            {enabledTabs.map(t => (
              <button
                key={t.key}
                className={tab === t.key ? 'font-bold underline' : ''}
                onClick={() => setTab(t.key as 'all' | 'home' | 'school')}
                disabled={isGuest && t.key !== 'all'}
              >
                {t.label}
              </button>
            ))}
          </div>
          {renderSymbolsGrid()}
        </>
      )}
    </div>
  )
}
