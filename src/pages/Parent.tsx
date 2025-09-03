import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { uploadImage, getSignedImageUrl } from '../utils/uploadImage'

const HOME_SCHOOL_KEY = 'aac_homeschool'
const OFFLINE_QUEUE_KEY = 'aac_homeschool_queue'
const PIN_KEY = 'aac_parent_pin'

type HomeSchoolSymbol = {
  id: string | number
  user_id: string
  image_url: string
  label: string
  type: 'aac' | 'upload'
  order: number
  home?: boolean
  school?: boolean
  fileData?: string
}

type OfflineAction =
  | { type: 'add'; data: HomeSchoolSymbol }
  | { type: 'remove'; id: number }
  | { type: 'update'; id: number; data: Partial<HomeSchoolSymbol> }
  | { type: 'tab_prefs'; data: { user_id: string, all_tab: boolean, home: boolean, school: boolean } }

type TabPrefs = { all_tab: boolean; home: boolean; school: boolean }

function isOnline() {
  return window.navigator.onLine
}

function addToOfflineQueue(action: OfflineAction) {
  const queue: OfflineAction[] = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
  queue.push(action)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}
function getOfflineQueue(): OfflineAction[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}
function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
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

export default function Parent() {
  // PIN logic
  const [showPinPrompt, setShowPinPrompt] = useState(true)
  const [pinInput, setPinInput] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinSetMode, setPinSetMode] = useState(false)
  const [pinConfirm, setPinConfirm] = useState('')

  const [user, setUser] = useState<any>(null)
  const [symbols, setSymbols] = useState<HomeSchoolSymbol[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: string]: string }>({})
  const [tab, setTab] = useState<'all' | 'home' | 'school'>('all')
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [tabPrefs, setTabPrefs] = useState<TabPrefs>({ all_tab: true, home: true, school: true })
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [prefsError, setPrefsError] = useState("")

  // PIN check on mount
  useEffect(() => {
    const storedPin = localStorage.getItem(PIN_KEY)
    if (!storedPin) {
      setPinSetMode(true)
      setShowPinPrompt(true)
    } else {
      setShowPinPrompt(true)
    }
  }, [])

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    const storedPin = localStorage.getItem(PIN_KEY)
    if (!storedPin) {
      if (!pinInput || !pinConfirm) {
        setPinError('Please enter and confirm your new PIN.')
        return
      }
      if (pinInput !== pinConfirm) {
        setPinError('PINs do not match.')
        return
      }
      localStorage.setItem(PIN_KEY, pinInput)
      setShowPinPrompt(false)
      setPinInput('')
      setPinConfirm('')
      setPinError('')
      setPinSetMode(false)
    } else {
      if (pinInput === storedPin) {
        setShowPinPrompt(false)
        setPinInput('')
        setPinError('')
      } else {
        setPinError('Incorrect PIN. Try again.')
      }
    }
  }

  function handlePinReset() {
    localStorage.removeItem(PIN_KEY)
    setPinSetMode(true)
    setPinInput('')
    setPinConfirm('')
    setPinError('')
    setShowPinPrompt(true)
  }

  // Fetch user and tab prefs -- robust fallback logic
  useEffect(() => {
    if (showPinPrompt) return;
    let cancelled = false;
    async function fetchPrefs() {
      setPrefsLoading(true)
      setPrefsError("")
      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError) console.error("Supabase auth error", authError)
        if (!auth?.user) {
          setPrefsLoading(false);
          return;
        }
        setUser(auth.user);

        if (navigator.onLine) {
          const { data: prefs, error } = await supabase
            .from('tab_prefs')
            .select('*')
            .eq('user_id', auth.user.id)
            .maybeSingle();
          if (error) {
            console.error("Supabase tab_prefs error", error)
            setPrefsError("Failed to load preferences from server.")
          }
          if (!cancelled) {
            if (prefs) {
              setTabPrefs({
                all_tab: prefs.all_tab ?? true,
                home: prefs.home ?? true,
                school: prefs.school ?? true,
              });
              localStorage.setItem("tab_prefs", JSON.stringify(prefs));
            } else {
              setTabPrefs({ all_tab: true, home: true, school: true });
              localStorage.setItem("tab_prefs", JSON.stringify({ all_tab: true, home: true, school: true }));
            }
            setPrefsLoading(false);
          }
        } else {
          const cached = localStorage.getItem("tab_prefs");
          if (cached) setTabPrefs(JSON.parse(cached));
          setPrefsLoading(false);
        }
      } catch (e) {
        console.error("Exception loading preferences", e)
        setPrefsError("Could not load preferences. Try again or contact support.")
        const cached = localStorage.getItem("tab_prefs");
        if (cached) setTabPrefs(JSON.parse(cached));
        setPrefsLoading(false);
      }
    }
    fetchPrefs();
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user)
        setPrefsLoading(true)
        setPrefsError("")
        try {
          const { data: prefs, error } = await supabase
            .from('tab_prefs')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle()
          if (error) {
            console.error("Supabase tab_prefs error", error)
            setPrefsError("Failed to load preferences from server.")
          }
          if (prefs) {
            setTabPrefs({
              all_tab: prefs.all_tab ?? true,
              home: prefs.home ?? true,
              school: prefs.school ?? true,
            })
            localStorage.setItem("tab_prefs", JSON.stringify(prefs))
          } else {
            setTabPrefs({ all_tab: true, home: true, school: true })
            localStorage.setItem("tab_prefs", JSON.stringify({ all_tab: true, home: true, school: true }))
          }
        } catch (err) {
          console.error("Exception loading preferences", err)
          setPrefsError("Could not load preferences. Try again or contact support.")
          const cached = localStorage.getItem("tab_prefs")
          if (cached) setTabPrefs(JSON.parse(cached))
        }
        setPrefsLoading(false)
      }
    })
    return () => {
      listener?.subscription.unsubscribe()
      cancelled = true
    }
  }, [showPinPrompt]);

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
    if (symbols.length > 0) {
      loadSignedUrlsAndCache()
    } else {
      setSignedUrls({})
    }
  }, [symbols])

  // Tab preference toggles
  async function handleTabPrefChange(tabKey: keyof TabPrefs) {
    if (!user) return
    const updated = { ...tabPrefs, [tabKey]: !tabPrefs[tabKey] }
    setTabPrefs(updated)
    if (isOnline()) {
      await supabase
        .from('tab_prefs')
        .upsert([
          {
            user_id: user.id,
            all_tab: updated.all_tab,
            home: updated.home,
            school: updated.school,
            updated_at: new Date().toISOString()
          }
        ])
    } else {
      addToOfflineQueue({
        type: 'tab_prefs',
        data: {
          user_id: user.id,
          all_tab: updated.all_tab,
          home: updated.home,
          school: updated.school
        }
      })
    }
  }

  const enabledTabs = [
    tabPrefs.all_tab && { key: 'all', label: 'All' },
    tabPrefs.home && { key: 'home', label: 'Home' },
    tabPrefs.school && { key: 'school', label: 'School' },
  ].filter(Boolean) as { key: 'all' | 'home' | 'school'; label: string }[]

  useEffect(() => {
    if (!(tab === 'all' && tabPrefs.all_tab) &&
        !(tab === 'home' && tabPrefs.home) &&
        !(tab === 'school' && tabPrefs.school)) {
      const first = enabledTabs[0]?.key || 'all'
      setTab(first as 'all' | 'home' | 'school')
    }
  }, [tabPrefs, enabledTabs])

  const filtered = tab === 'all'
    ? symbols
    : tab === 'home'
      ? symbols.filter(s => s.home)
      : symbols.filter(s => s.school)

  async function handleToggleHomeSchool(sym: AacSymbol, home: boolean, school: boolean) {
    if (!user) return
    const exists = symbols.find(f => f.label === sym.text && f.type === 'aac')
    if (!exists) {
      const order = symbols.length > 0 ? Math.max(...symbols.map(f => f.order ?? 0)) + 1 : 1
      const newSym: HomeSchoolSymbol = {
        id: Date.now(),
        user_id: user.id,
        image_url: sym.imagePath,
        label: sym.text,
        type: 'aac',
        order,
        home,
        school,
      }
      setSymbols([...symbols, newSym])
      if (isOnline()) {
        await supabase.from('homeschool').insert([newSym])
      } else {
        addToOfflineQueue({ type: 'add', data: newSym })
      }
    } else {
      const updated = symbols.map(s =>
        s.id === exists.id ? { ...s, home, school } : s
      )
      setSymbols(updated)
      if (isOnline()) {
        await supabase.from('homeschool').update({ home, school }).eq('id', exists.id)
      } else {
        addToOfflineQueue({ type: 'update', id: exists.id as number, data: { home, school } })
      }
    }
  }

  async function handleUploadToggleHomeSchool(sym: HomeSchoolSymbol, home: boolean, school: boolean) {
    const updated = symbols.map(s =>
      s.id === sym.id ? { ...s, home, school } : s
    )
    setSymbols(updated)
    if (isOnline()) {
      await supabase.from('homeschool').update({ home, school }).eq('id', sym.id)
    } else {
      addToOfflineQueue({ type: 'update', id: sym.id as number, data: { home, school } })
    }
  }

  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!user || !uploadFile || !uploadLabel) return
    const order = symbols.length > 0 ? Math.max(...symbols.map(f => f.order ?? 0)) + 1 : 1

    if (!isOnline()) {
      const reader = new FileReader()
      reader.onload = () => {
        const newSym: HomeSchoolSymbol = {
          id: Date.now(),
          user_id: user.id,
          image_url: '',
          label: uploadLabel,
          type: 'upload',
          order,
          home: false,
          school: false,
          fileData: reader.result as string,
        }
        const updated = [...symbols, newSym]
        setSymbols(updated)
        localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify(updated))
        addToOfflineQueue({ type: 'add', data: newSym })
        setUploadLabel('')
        setUploadFile(null)
      }
      reader.readAsDataURL(uploadFile)
      return
    }

    setUploading(true)
    const path = await uploadImage(uploadFile, user.id)
    setUploading(false)
    if (!path) return
    const { error: uploadError } = await supabase
      .from('homeschool')
      .insert([{ user_id: user.id, image_url: path, label: uploadLabel, type: 'upload', order, home: false, school: false }])
    if (!uploadError) {
      setUploadLabel('')
      setUploadFile(null)
      fetchSymbols()
    } else {
      setError(uploadError.message)
    }
  }

  async function handleRemoveSymbol(id: number) {
    const updated = symbols.filter(f => Number(f.id) !== Number(id))
    setSymbols(updated)
    if (isOnline()) {
      await supabase.from('homeschool').delete().eq('id', id)
    } else {
      addToOfflineQueue({ type: 'remove', id })
    }
  }

  useEffect(() => {
    if (!user) return
    function syncOfflineQueue() {
      if (!isOnline()) return
      const queue: OfflineAction[] = getOfflineQueue()
      if (!queue.length) return

      Promise.all(queue.map(async action => {
        if (action.type === 'add') {
          const { id, fileData, ...toInsert } = action.data
          if (fileData) {
            try {
              const res = await fetch(fileData as string)
              const blob = await res.blob()
              const file = new File([blob], "offline-upload.png", { type: blob.type })
              const path = await uploadImage(file, toInsert.user_id)
              if (path) {
                toInsert.image_url = path
              } else {
                return
              }
            } catch {
              return
            }
          }
          await supabase.from('homeschool').insert([{ ...toInsert }])
        } else if (action.type === 'remove') {
          await supabase.from('homeschool').delete().eq('id', action.id)
        } else if (action.type === 'update') {
          await supabase.from('homeschool').update(action.data).eq('id', action.id)
        } else if (action.type === 'tab_prefs') {
          await supabase.from('tab_prefs').upsert([
            {
              user_id: action.data.user_id,
              all_tab: action.data.all_tab,
              home: action.data.home,
              school: action.data.school,
              updated_at: new Date().toISOString()
            }
          ])
        }
      })).then(() => {
        clearOfflineQueue()
        fetchSymbols()
      })
    }
    window.addEventListener('online', syncOfflineQueue)
    if (isOnline()) syncOfflineQueue()
    return () => window.removeEventListener('online', syncOfflineQueue)
  }, [user, symbols])

  if (showPinPrompt) {
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50">
        <form onSubmit={handlePinSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xs text-center">
          <h2 className="text-xl font-bold mb-4">
            {pinSetMode ? 'Set a Parent PIN' : 'Enter Parent PIN'}
          </h2>
          <input
            type="password"
            value={pinInput}
            onChange={e => setPinInput(e.target.value)}
            placeholder="Enter PIN"
            className="border rounded p-2 w-full mb-2"
            maxLength={8}
            autoFocus
          />
          {pinSetMode && (
            <input
              type="password"
              value={pinConfirm}
              onChange={e => setPinConfirm(e.target.value)}
              placeholder="Confirm PIN"
              className="border rounded p-2 w-full mb-2"
              maxLength={8}
            />
          )}
          {pinError && <div className="text-red-600 mb-2">{pinError}</div>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2">
            {pinSetMode ? 'Set PIN' : 'Unlock'}
          </button>
          {!pinSetMode && (
            <button
              type="button"
              className="text-blue-500 underline text-xs"
              onClick={handlePinReset}
            >
              Forgot PIN? Reset
            </button>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded shadow">
      <div className="flex flex-row justify-between items-center mb-4">
        <div className="flex gap-2">
          <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => window.location.href = '/'}>Back</button>
          <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => window.location.href = '/how-to'}>How To Guide</button>
        </div>
        <h2 className="text-2xl font-bold text-center flex-1">Welcome, Parent!</h2>
        <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}>Sign Out</button>
      </div>
      <div className="mb-4 text-center">
        <span>You are signed in as <span className="font-mono">{user?.email}</span></span>
      </div>
      {prefsLoading
        ? <div className="text-center text-gray-500 my-6">
            Loading preferences...
            {prefsError && <div className="text-red-600 mt-2">{prefsError}</div>}
          </div>
        : (
          <div className="flex flex-row justify-center gap-4 mb-4">
            {[
              { key: 'all_tab', label: 'All' },
              { key: 'home', label: 'Home' },
              { key: 'school', label: 'School' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={tabPrefs[key as keyof TabPrefs]}
                  onChange={() => handleTabPrefChange(key as keyof TabPrefs)}
                />
                Show {label} Tab
              </label>
            ))}
          </div>
        )
      }
      <div className="flex gap-4 mb-4 justify-center">
        {enabledTabs.map(t => (
          <button
            key={t.key}
            className={tab === t.key ? 'font-bold underline' : ''}
            onClick={() => setTab(t.key as 'all' | 'home' | 'school')}
          >
            {t.label}
          </button>
        ))}
      </div>
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
      <div className="mb-4 flex gap-2 flex-wrap">
        {aacSymbols.map(sym => {
          const exist = symbols.find(s => s.label === sym.text && s.type === 'aac')
          return (
            <div key={sym.text} className="border rounded px-2 py-1 flex items-center gap-3 bg-gray-50 mb-2">
              <img src={sym.imagePath} alt={sym.text} className="w-8 h-8 object-cover rounded" />
              <span className="text-xs">{sym.text}</span>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={!!exist?.home}
                  onChange={e =>
                    handleToggleHomeSchool(sym, e.target.checked, exist?.school || false)
                  }
                />
                Home
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={!!exist?.school}
                  onChange={e =>
                    handleToggleHomeSchool(sym, exist?.home || false, e.target.checked)
                  }
                />
                School
              </label>
              {!!exist && (
                <button
                  onClick={() => handleRemoveSymbol(Number(exist.id))}
                  className="ml-2 px-1 py-0 bg-red-400 text-white rounded text-xs"
                  title="Remove from Home/School"
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {symbols
          .filter(s => s.type === 'upload')
          .map(sym => (
            <div key={sym.id} className="border rounded px-2 py-1 flex items-center gap-3 bg-gray-50 mb-2">
              <img src={getSymbolImgSrc(sym, signedUrls)} alt={sym.label} className="w-8 h-8 object-cover rounded" />
              <span className="text-xs">{sym.label}</span>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={!!sym.home}
                  onChange={e =>
                    handleUploadToggleHomeSchool(sym, e.target.checked, sym.school || false)
                  }
                />
                Home
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={!!sym.school}
                  onChange={e =>
                    handleUploadToggleHomeSchool(sym, sym.home || false, e.target.checked)
                  }
                />
                School
              </label>
              <button
                onClick={() => handleRemoveSymbol(Number(sym.id))}
                className="ml-2 px-1 py-0 bg-red-400 text-white rounded text-xs"
                title="Remove upload"
              >
                ✕
              </button>
            </div>
          ))}
      </div>
      <hr className="my-6" />
      <div>
        <h3 className="font-bold mb-2">Your Symbols</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-4">
          {filtered.length === 0 && (
            <p className="col-span-full text-gray-600 text-center">(No symbols yet)</p>
          )}
          {filtered.map((sym: any) => (
            <div key={sym.id} className="border rounded p-2 flex flex-col items-center bg-gray-50">
              <img
                src={getSymbolImgSrc(sym, signedUrls)}
                alt={sym.label}
                className="w-16 h-16 object-cover rounded mb-2"
                style={{ background: '#E0E7EF' }}
              />
              <div className="text-center text-xs font-medium mb-1">{sym.label}</div>
              <div className="flex gap-1 mb-1 text-xs">
                <span>{sym.home ? 'Home' : ''}{sym.home && sym.school ? ',' : ''}{sym.school ? 'School' : ''}</span>
              </div>
              <button
                onClick={() => handleRemoveSymbol(Number(sym.id))}
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
