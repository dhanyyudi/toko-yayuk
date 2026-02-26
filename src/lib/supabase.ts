import { createClient } from '@supabase/supabase-js'

// DEPRECATED: Use @/lib/supabase/client for browser or @/lib/supabase/server for server components
// This file is kept for backward compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getImageUrl(path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}
