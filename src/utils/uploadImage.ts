import { supabase } from '../supabaseClient'

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('user-uploads')
    .upload(fileName, file)

  if (error) {
    console.error('Upload error:', error)
    return null
  }
  return data.path // or data.fullPath if available
}

// ... keep your getImageUrl function ...
export function getImageUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const cleanedPath = path.replace(/^public\/user-uploads\//, '').replace(/^user-uploads\//, '')
  const { data } = supabase.storage.from('user-uploads').getPublicUrl(cleanedPath)
  return data?.publicUrl || ''
}