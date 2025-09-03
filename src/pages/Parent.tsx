import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { aacSymbols, AacSymbol } from '../data/aac-symbols'
import { uploadImage, getSignedImageUrl } from '../utils/uploadImage'
import { useNavigate } from 'react-router-dom'

const HOME_SCHOOL_KEY = 'aac_homeschool'
const OFFLINE_QUEUE_KEY = 'aac_homeschool_queue'

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
  fileData?: string
}

type OfflineAction =
  | { type: 'add'; data: HomeSchoolSymbol }
  | { type: 'remove'; id: number }
  | { type: 'update'; id: number; data: Partial<HomeSchoolSymbol> }

function clearOfflineQueue() {
  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}
function getOfflineQueue(): OfflineAction[] {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]')
  } catch {
    return []
  }
}
function addToOfflineQueue(action: OfflineAction) {
  const queue = getOfflineQueue()
  queue.push(action)
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue))
}

export default function Parent() {
  const [user, setUser] = useState<any>(null)
  const [symbols, setSymbols] = useState<HomeSchoolSymbol[]>([])
  const [signedUrls, setSignedUrls] = useState<{ [id: number]: string }>({})
  const [tab, setTab] = useState<'all' | 'home' | 'school'>('all')
  const [uploading, setUploading] = useState(false)
  const [uploadLabel, setUploadLabel] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

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
      const urlMap: { [id: number]: string } = {}
      await Promise.all(
        uploads.map(async sym => {
          urlMap[sym.id] = await getSignedImageUrl(sym.image_url)
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

  // Upload new image logic
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
    const { error } = await supabase
      .from('homeschool')
      .insert([{ user_id: user.id, image_url: path, label: uploadLabel, type: 'upload', order, home: false, school: false }])
    if (!error) {
      setUploadLabel('')
      setUploadFile(null)
      fetchSymbols()
    } else {
      setError(error.message)
    }
  }

  // Toggle Home/School for AAC or Upload
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
      localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify([...symbols, newSym]))
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
      localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify(updated))
      if (isOnline()) {
        await supabase.from('homeschool').update({ home, school }).eq('id', exists.id)
      } else {
        addToOfflineQueue({ type: 'update', id: exists.id as number, data: { home, school } })
      }
    }
  }

  // Toggle for uploads after upload
  async function handleUploadToggleHomeSchool(sym: HomeSchoolSymbol, home: boolean, school: boolean) {
    const updated = symbols.map(s =>
      s.id === sym.id ? { ...s, home, school } : s
    )
    setSymbols(updated)
    localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify(updated))
    if (isOnline()) {
      await supabase.from('homeschool').update({ home, school }).eq('id', sym.id)
    } else {
      addToOfflineQueue({ type: 'update', id: sym.id as number, data: { home, school } })
    }
  }

  // Remove symbol
  async function handleRemoveSymbol(id: number) {
    const updated = symbols.filter(f => Number(f.id) !== Number(id))
    setSymbols(updated)
    localStorage.setItem(HOME_SCHOOL_KEY, JSON.stringify(updated))
    if (isOnline()) {
      await supabase.from('homeschool').delete().eq('id', id)
    } else {
      addToOfflineQueue({ type: 'remove', id })
    }
  }

  // Sync offline queue
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

  // Filtering by tab
  const filtered = tab === 'all'
    ? symbols
    : tab === 'home'
      ? symbols.filter(s => s.home)
      : symbols.filter(s => s.school)

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <div className="flex gap-4 mb-4">
        <button className={tab === 'all' ? 'font-bold underline' : ''} onClick={() => setTab('all')}>All</button>
        <button className={tab === 'home' ? 'font-bold underline' : ''} onClick={() => setTab('home')}>Home</button>
        <button className={tab === 'school' ? 'font-bold underline' : ''} onClick={() => setTab('school')}>School</button>
      </div>

      {/* Upload new symbol */}
      <div className="mb-8">
        <h3 className="font-bold mb-2">Upload new image symbol</h3>
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
        {!isOnline() && <div className="text-yellow-600 mt-2">Offline: Uploads will be queued and synced when you go back online</div>}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>

      {/* Home/School checkboxes for AAC */}
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

      {/* Home/School checkboxes for uploads */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {symbols
          .filter(s => s.type === 'upload')
          .map(sym => (
            <div key={sym.id} className="border rounded px-2 py-1 flex items-center gap-3 bg-gray-50 mb-2">
              <img src={signedUrls[sym.id] || sym.image_url} alt={sym.label} className="w-8 h-8 object-cover rounded" />
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
                src={sym.type === 'aac'
                  ? sym.image_url
                  : (signedUrls[sym.id] || sym.image_url)}
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
