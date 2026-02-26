import { createClient } from '@supabase/supabase-js'

// DEPRECATED: Use @/lib/supabase/client for browser or @/lib/supabase/server for server components
// This file is kept for backward compatibility

// Lazy initialization - client only created when first accessed
let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('supabaseUrl is required.')
    }
    
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// For backward compatibility - lazy access with error handling
let supabaseClient: ReturnType<typeof createClient> | undefined

try {
  supabaseClient = getSupabaseClient()
} catch {
  // During build time, env vars might not be available
  // The client code should handle this gracefully
}

export const supabase = supabaseClient!

export function getImageUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return ''
  }
  return `${supabaseUrl}/storage/v1/object/public/product-images/${path}`
}
