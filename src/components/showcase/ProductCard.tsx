'use client'

import Image from 'next/image'
import { ProductFull } from '@/types/database'
import { getPriceByType, getPrimaryImage } from '@/lib/data'

interface ProductCardProps {
  product: ProductFull
}

export function ProductCard({ product }: ProductCardProps) {
  const sellPrice = getPriceByType(product, 'sell_piece')
  const cratePrice = getPriceByType(product, 'crate')
  const dozenPrice = getPriceByType(product, 'dozen')
  const basePrice = getPriceByType(product, 'base_piece')
  const imageUrl = getPrimaryImage(product)
  const defaultVariant = product.product_variants?.find((v) => v.is_default)
  const packQty = defaultVariant?.pack_qty

  const badges = product.product_badges || []

  function formatRp(amount: number): string {
    return `Rp${amount.toLocaleString('id-ID')}`
  }

  return (
    <div className="product-card">
      {/* Badges */}
      {badges.length > 0 && (
        <div className="badge-container">
          {badges.map((badge) => (
            <span
              key={badge.id}
              className={`badge badge-${badge.badge_type.toLowerCase().replace('_', '-')}`}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Product Image */}
      <div className="product-image-wrapper">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            width={160}
            height={160}
            className="product-image"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <div className="product-image-placeholder">
            <span>🍦</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {/* Main sell price */}
        {sellPrice && (
          <div className="sell-price">
            <span className="price-label">Harga</span>
            <span className="price-value">{formatRp(sellPrice)}</span>
          </div>
        )}

        {/* Detail prices */}
        <div className="price-details">
          {packQty && (
            <div className="price-row">
              <span className="price-detail-label">Isi/Krat</span>
              <span className="price-detail-value">{packQty} pcs</span>
            </div>
          )}
          {cratePrice && (
            <div className="price-row">
              <span className="price-detail-label">Per Krat</span>
              <span className="price-detail-value">{formatRp(cratePrice)}</span>
            </div>
          )}
          {dozenPrice && (
            <div className="price-row">
              <span className="price-detail-label">Per Lusin</span>
              <span className="price-detail-value">{formatRp(dozenPrice)}</span>
            </div>
          )}
          {basePrice && (
            <div className="price-row">
              <span className="price-detail-label">Modal/pcs</span>
              <span className="price-detail-value">{formatRp(basePrice)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
