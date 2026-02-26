import { supabase } from './supabase'
import { ProductFull, QRCode } from '@/types/database'

export async function getWallsProducts(): Promise<ProductFull[]> {
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
