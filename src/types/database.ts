export interface Category {
  id: number
  name: string
  slug: string
  status: string
}

export interface Product {
  id: number
  code: string | null
  slug: string
  name: string
  description: string | null
  brand: string | null
  category_id: number
  status: string
  created_at: string
  updated_at: string
  // Joined fields
  product_variants?: ProductVariant[]
  product_media?: ProductMedia[]
  product_badges?: ProductBadge[]
}

export interface ProductVariant {
  id: number
  product_id: number
  sku: string | null
  pack_qty: number | null
  unit: string
  is_default: boolean
  status: string
  // Joined
  product_prices?: ProductPrice[]
}

export interface ProductPrice {
  id: number
  variant_id: number
  price_type: 'sell_piece' | 'base_piece' | 'crate' | 'dozen'
  amount: number
  currency: string
  is_active: boolean
}

export interface ProductMedia {
  id: number
  product_id: number
  url: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

export interface ProductBadge {
  id: number
  product_id: number
  badge_type: string
  label: string
  color: string | null
  sort_order: number
}

export interface QRCode {
  id: number
  url: string
  short_url: string | null
  qr_image_base64: string | null
  is_active: boolean
}

// Full product with all relationships
export interface ProductFull extends Product {
  product_variants: (ProductVariant & { product_prices: ProductPrice[] })[]
  product_media: ProductMedia[]
  product_badges: ProductBadge[]
}
