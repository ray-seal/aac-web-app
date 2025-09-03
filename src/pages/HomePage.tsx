import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getSignedImageUrl } from '../utils/uploadImage'

const HOME_SCHOOL_KEY = 'aac_homeschool'
const TAB_PREF_KEY = 'aac_tab_preferences'

function isOnline() {
  return window.navigator.onLine
}

type HomeSchoolSymbol = {
  id: string | number
  user_id: string
  image_url: string
  label: string
  type: 'aac' | 'upload'
  order: number
  home?: boolean
  school?: boolean
}

type TabPrefs = { all: boolean; home: boolean; school: boolean }

function getTabPrefs(): TabPrefs {
  try {
    return JSON.parse(localStorage.getItem(TAB_PREF_KEY) || '')
      ?? { all: true, home: true, school: true }
  } catch {
    return { all: true, home: true, school: true }
  }
}

export default function HomePage() {
  const [tab, setTab] = useState<'all' | 'home' | 'school'>('all')
  const [user, setUser] = useState<any>(null)
  const [symbols, setSymbols] = useState<HomeSchoolSymbol[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: string]: string }>({})
  const [tabPrefs, setTabPrefs] = useState<TabPrefs>(getTabPrefs())

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
      setSymbols([])
      setSignedUrls({})
      return
    }
    fetchSymbols()
  }, [user])

  async function fetchSymbols() {
    if (isOnline()) {
      const { data } = await supabase
        .from('homeschool')
        .select('*')
        .eq('user_id', user.id)
        .order('order', { ascending: true })
      setSymbols(data ?? [])
      localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify(data ?? []))
    } else {
      const offline = localStorage.getItem(HOME_SCHOOL_KEY)
      setSymbols(offline ? JSON.parse(offline) : [])
    }
  }

  useEffect(() => {
    async function loadSignedUrls() {
      const uploads = symbols.filter(f => f.type !== 'aac')
      const urlMap: { [id: string]: string } = {}
      await Promise.all(
        uploads.map(async sym => {
          urlMap[String(sym.id)] = await getSignedImageUrl(sym.image_url)
        })
      )
      setSignedUrls(urlMap)
    }
    if (symbols.length > 0) {
      loadSignedUrls()
    } else {
      setSignedUrls({})
    }
  }, [symbols])

  // Only show enabled tabs in UI
  const enabledTabs = [
    tabPrefs.all && { key: 'all', label: 'All' },
    tabPrefs.home && { key: 'home', label: 'Home' },
    tabPrefs.school && { key: 'school', label: 'School' },
  ].filter(Boolean) as { key: 'all' | 'home' | 'school'; label: string }[]

  // Set tab to first enabled if current one disabled
  useEffect(() => {
    if (!tabPrefs[tab]) {
      const first = enabledTabs[0]?.key || 'all'
      setTab(first)
    }
    // eslint-disable-next-line
  }, [tabPrefs])

  // Filtered symbols by tab
  const filtered = tab === 'all'
    ? symbols
    : tab === 'home'
      ? symbols.filter(s => s.home)
      : symbols.filter(s => s.school)

  function renderSymbolsGrid() {
    if (!filtered.length)
      return <div className="p-4 text-center text-gray-500">No symbols yet.</div>
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {filtered.map((sym: any) => (
          <div key={sym.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
            <img
              src={sym.type === 'aac' ? sym.image_url : (signedUrls[String(sym.id)] || sym.image_url)}
              alt={sym.label}
              className="w-16 h-16 object-cover rounded mb-2"
            />
            <div className="text-center text-xs font-medium mb-1">{sym.label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="mb-4 flex justify-end">
        <Link to="/parent" className="text-blue-500 underline">Parent</Link>
      </div>
      <div className="flex gap-4 mb-6 justify-center">
        {enabledTabs.map(t => (
          <button
            key={t.key}
            className={tab === t.key ? 'font-bold underline' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {renderSymbolsGrid()}
    </div>
  )
}
