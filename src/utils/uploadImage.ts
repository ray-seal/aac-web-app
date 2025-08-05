import { supabase } from '../supabaseClient'

/**
 * Get a public URL for an image in the user-uploads bucket.
 * @param path The storage path (e.g. 'filename.jpg' or 'folder/filename.jpg')
 * @returns The public URL string, or empty string if path is missing.
 */
export function getImageUrl(path: string): string {
  if (!path) return ''
  // If the path is already a full URL, just return it
  if (path.startsWith('http')) return path

  // Clean up the path if it includes 'public/user-uploads/' or 'user-uploads/'
  const cleanedPath = path.replace(/^public\/user-uploads\//, '').replace(/^user-uploads\//, '')

  // Get the public URL from Supabase storage
  const { data } = supabase.storage.from('user-uploads').getPublicUrl(cleanedPath)
  return data?.publicUrl || ''
}