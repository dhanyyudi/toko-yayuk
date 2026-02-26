import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern for browser client
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Browser-side only
  if (typeof window === 'undefined') {
    // Return a dummy client for SSR/build that won't be used
    // The real client will be created on hydration
    return null as any
  }
  
  if (!browserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('@supabase/ssr: Your project\'s URL and API key are required!')
    }
    
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  return browserClient
}
