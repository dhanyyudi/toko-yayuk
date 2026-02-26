import { ProductFull } from '@/types/database'
import { getPrimaryImage } from '@/lib/data'

interface Props {
  product: ProductFull
}

export function ProductBubble({ product }: Props) {
  const imageUrl = getPrimaryImage(product)

  return (
    <div className="product-bubble">
      <div className="bubble-img-container">
        {imageUrl ? (
          // Native <img> used intentionally for reliable print rendering
          // (next/image span wrappers cause skeleton rectangles in PDF export)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            className="bubble-img"
          />
        ) : (
          <span className="bubble-placeholder">🍦</span>
        )}
      </div>
      <p className="bubble-name">{product.name}</p>
    </div>
  )
}
