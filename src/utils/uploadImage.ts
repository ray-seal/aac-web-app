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
  return data.path // path to store in DB
}

// Async: get a signed URL for a private file
export async function getSignedImageUrl(path: string): Promise<string> {
  if (!path) return ''
  // Clean up the path in case it includes bucket info
  const cleanedPath = path.replace(/^public\/user-uploads\//, '').replace(/^user-uploads\//, '')
  const { data, error } = await supabase
    .storage
    .from('user-uploads')
    .createSignedUrl(cleanedPath, 60 * 60) // valid for 1 hour
  if (error) {
    console.error('Signed URL error:', error)
    return ''
  }
  return data.signedUrl
}