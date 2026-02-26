import { getWallsProducts, getActiveQRCode, getPriceByType } from '@/lib/data'
import { ProductFull } from '@/types/database'
import { ProductBubble } from '@/components/showcase/ProductBubble'
import { QRCodeDisplay } from '@/components/showcase/QRCodeDisplay'
import { PrintButton } from '@/components/showcase/PrintButton'

const PRICE_SECTIONS = [
  { price: 2500, label: 'Rp 2.500', className: 'blob-pink' },
  { price: 3000, label: 'Rp 3.000', className: 'blob-blue' },
  { price: 3500, label: 'Rp 3.500', className: 'blob-green' },
  { price: 4000, label: 'Rp 4.000', className: 'blob-purple' },
  { price: 5000, label: 'Rp 5.000', className: 'blob-orange' },
]

// Pair sections into rows: [2500,3000], [3500,4000], [5000 full]
const ROWS = [
  [PRICE_SECTIONS[0], PRICE_SECTIONS[1]],
  [PRICE_SECTIONS[2], PRICE_SECTIONS[3]],
  [PRICE_SECTIONS[4]],
]

function groupByPrice(products: ProductFull[]): Map<number, ProductFull[]> {
  const map = new Map<number, ProductFull[]>()
  for (const p of products) {
    const price = getPriceByType(p, 'sell_piece')
    if (price !== null) {
      if (!map.has(price)) map.set(price, [])
      map.get(price)!.push(p)
    }
  }
  return map
}

// Decorative floating circles for the background
const DECO_CIRCLES = [
  { size: 90, top: '8%',  left: '12%',  opacity: 0.08 },
  { size: 60, top: '18%', right: '6%',  opacity: 0.07 },
  { size: 130, top: '42%', left: '2%',  opacity: 0.06 },
  { size: 50, top: '55%', right: '10%', opacity: 0.09 },
  { size: 80, bottom: '10%', left: '40%', opacity: 0.07 },
  { size: 40, bottom: '25%', right: '3%', opacity: 0.08 },
]

export default async function ShowcasePage() {
  const products = await getWallsProducts()
  const qrCode = await getActiveQRCode()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const qrUrl = qrCode?.url || siteUrl
  const grouped = groupByPrice(products)

  return (
    <div className="poster-page">
      <div className="poster-wrapper">

        {/* ── Header ── */}
        <header className="poster-header">
          <div className="header-left">
            <div className="walls-logo-circle">❤️</div>
            <div className="header-text">
              <h1 className="brand-title">WALLS ICE CREAM</h1>
              <p className="brand-tagline">semua jadi happy</p>
            </div>
          </div>
          <div className="header-right">
            <div className="halal-badge">
              <span className="halal-text">🌙 HALAL</span>
            </div>
          </div>
        </header>

        {/* ── Toolbar (hidden on print) ── */}
        <PrintButton />

        {/* ── Main content: colorful gradient area with blobs ── */}
        <div className="poster-content">

          {/* Decorative background circles */}
          {DECO_CIRCLES.map((c, i) => (
            <div
              key={i}
              className="deco-circle"
              style={{
                width: c.size,
                height: c.size,
                top: (c as { top?: string; bottom?: string }).top,
                bottom: (c as { top?: string; bottom?: string }).bottom,
                left: (c as { left?: string; right?: string }).left,
                right: (c as { left?: string; right?: string }).right,
                opacity: c.opacity,
              }}
            />
          ))}

          {/* Blob grid */}
          <div className="blob-layout">
            {ROWS.map((row, rowIdx) => (
              row.map((section) => {
                const sectionProducts = grouped.get(section.price) || []
                if (sectionProducts.length === 0) return null
                return (
                  <div
                    key={section.price}
                    className={`blob-section ${section.className}${rowIdx === 2 ? ' blob-full' : ''}`}
                  >
                    <div className="price-badge">{section.label}</div>
                    <div className="blob-products">
                      {sectionProducts.map((product) => (
                        <ProductBubble key={product.id} product={product} />
                      ))}
                    </div>
                  </div>
                )
              })
            ))}
          </div>
        </div>

        {/* ── Footer with QR Code ── */}
        <footer className="poster-footer">
          <div className="store-info">
            <p className="store-name">🏪 Toko Yayuk</p>
            <p className="store-tagline">Scan QR untuk melihat produk &amp; harga terbaru</p>
          </div>
          <QRCodeDisplay url={qrUrl} size={130} />
        </footer>

      </div>
    </div>
  )
}
