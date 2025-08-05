import { supabase } from '../supabaseClient'

export async function uploadImage(file: File, userId: string): Promise<string | null> {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/${Date.now()}.${fileExt}`
  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(filePath, file, { upsert: false })
  if (error) {
    alert(error.message)
    return null
  }
  return filePath
}

export function getImageUrl(path: string): string {
  return supabase.storage.from('user-uploads').getPublicUrl(path).data.publicUrl
}