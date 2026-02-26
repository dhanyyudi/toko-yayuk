import { createClient } from '@supabase/supabase-js'
import { ProductFull, QRCode } from '@/types/database'

// Create client lazily to handle build-time when env vars aren't available
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Build] Supabase env vars not available, returning null')
    return null
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function getWallsProducts(): Promise<ProductFull[]> {
  const supabase = createSupabaseClient()
  
  if (!supabase) {
    // During build time, return empty array
    console.log('[Build] Returning empty products array')
    return []
  }
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        *,
        product_prices (*)
      ),
      product_media (*),
      product_badges (*)
    `)
    .eq('status', 'active')
    .order('id')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []) as ProductFull[]
}

export async function getProductBySlug(slug: string): Promise<ProductFull | null> {
  const supabase = createSupabaseClient()
  
  if (!supabase) {
    return null
  }
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        *,
        product_prices (*)
      ),
      product_media (*),
      product_badges (*)
    `)
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as ProductFull
}

export async function getActiveQRCode(): Promise<QRCode | null> {
  const supabase = createSupabaseClient()
  
  if (!supabase) {
    return null
  }
  
  const { data } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()

  return data as QRCode | null
}

export function getPriceByType(
  product: ProductFull,
  type: 'sell_piece' | 'base_piece' | 'crate' | 'dozen'
): number | null {
  const defaultVariant = product.product_variants?.find((v) => v.is_default)
  if (!defaultVariant) return null
  const price = defaultVariant.product_prices?.find((p) => p.price_type === type)
  return price?.amount ?? null
}

export function getPrimaryImage(product: ProductFull): string | null {
  const primary = product.product_media?.find((m) => m.is_primary)
  return primary?.url ?? product.product_media?.[0]?.url ?? null
}
