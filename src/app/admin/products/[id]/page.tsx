'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getImageUrl } from '@/lib/supabase'
import { ProductFull } from '@/types/database'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Upload, ImageIcon, CheckCircle2 } from 'lucide-react'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

const BADGE_TYPES = [
  { type: 'BARU', label: 'BARU!', color: '#E8001A' },
  { type: 'BEST_SELLER', label: 'BEST SELLER', color: '#FF6B35' },
  { type: 'PROMO', label: 'PROMO', color: '#7C3AED' },
]

export default function EditProductPage({ params }: EditProductPageProps) {
  const router = useRouter()
  // Use `use()` to unwrap the Promise
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  const supabase = createClient()
  
  const [product, setProduct] = useState<ProductFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [cratePrice, setCratePrice] = useState('')
  const [dozenPrice, setDozenPrice] = useState('')
  const [packQty, setPackQty] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [activeBadges, setActiveBadges] = useState<string[]>([])

  useEffect(() => {
    if (!productId) return
    async function loadProduct() {
      const { data } = await supabase
        .from('products')
        .select(`*, product_variants(*, product_prices(*)), product_media(*), product_badges(*)`)
        .eq('id', productId)
        .single()

      if (data) {
        const p = data as ProductFull
        setProduct(p)
        setName(p.name)
        setDescription(p.description || '')

        const variant = p.product_variants?.find((v) => v.is_default)
        if (variant) {
          setPackQty(String(variant.pack_qty || ''))
          const prices = variant.product_prices || []
          const getAmt = (type: string) => String(prices.find((x) => x.price_type === type)?.amount || '')
          setSellPrice(getAmt('sell_piece'))
          setBasePrice(getAmt('base_piece'))
          setCratePrice(getAmt('crate'))
          setDozenPrice(getAmt('dozen'))
        }

        const primaryMedia = p.product_media?.find((m) => m.is_primary)
        setImageUrl(primaryMedia?.url || '')
        setActiveBadges((p.product_badges || []).map((b) => b.badge_type))
      }
      setLoading(false)
    }
    loadProduct()
  }, [productId, supabase])

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !productId) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const filePath = `${productId}/primary.${ext}`
    const { error } = await supabase.storage.from('product-images').upload(filePath, file, { upsert: true })
    if (!error) {
      const url = getImageUrl(filePath)
      setImageUrl(url)
      // Save to product_media
      await supabase.from('product_media').upsert({
        product_id: Number(productId),
        url,
        alt_text: name,
        is_primary: true,
        sort_order: 0,
      }, { onConflict: 'product_id' })
    }
    setUploading(false)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!product || !productId) return
    setSaving(true)
    setSuccess(false)

    // Update product name & description
    await supabase.from('products').update({ name, description, updated_at: new Date().toISOString() }).eq('id', productId)

    // Update variant pack_qty
    const variant = product.product_variants?.find((v) => v.is_default)
    if (variant) {
      await supabase.from('product_variants').update({ pack_qty: Number(packQty) || null }).eq('id', variant.id)

      // Update prices
      const priceUpdates = [
        { type: 'sell_piece', value: sellPrice },
        { type: 'base_piece', value: basePrice },
        { type: 'crate', value: cratePrice },
        { type: 'dozen', value: dozenPrice },
      ]

      for (const { type, value } of priceUpdates) {
        if (!value) continue
        const existing = variant.product_prices?.find((p) => p.price_type === type)
        if (existing) {
          await supabase.from('product_prices').update({ amount: Number(value) }).eq('id', existing.id)
        } else {
          await supabase.from('product_prices').insert({ variant_id: variant.id, price_type: type, amount: Number(value), currency: 'IDR', is_active: true })
        }
      }
    }

    // Update badges: delete all, re-insert selected
    await supabase.from('product_badges').delete().eq('product_id', productId)
    for (const badgeType of activeBadges) {
      const def = BADGE_TYPES.find((b) => b.type === badgeType)
      if (def) {
        await supabase.from('product_badges').insert({
          product_id: Number(productId),
          badge_type: def.type,
          label: def.label,
          color: def.color,
          sort_order: 1,
        })
      }
    }

    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  function toggleBadge(type: string) {
    setActiveBadges((prev) =>
      prev.includes(type) ? prev.filter((b) => b !== type) : [...prev, type]
    )
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground bg-muted/40">
      ⏳ Memuat data produk...
    </div>
  )
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center text-destructive bg-muted/40">
      ❌ Produk tidak ditemukan.
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/40 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/admin">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Kembali</span>
          </Link>
        </Button>
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-xl tracking-tight hidden sm:inline-block">Edit Produk:</span>
          <span className="text-xl font-bold tracking-tight text-primary">{product.name}</span>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        {success && (
          <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-lg p-4 flex items-center gap-3 font-medium shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
            ✅ Perubahan berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">

          {/* Product Name & Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                📝 Informasi Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="resize-y"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="packQty">Isi per Krat (pcs)</Label>
                <Input 
                  id="packQty" 
                  type="number" 
                  value={packQty} 
                  onChange={(e) => setPackQty(e.target.value)} 
                  placeholder="Contoh: 40" 
                />
              </div>
            </CardContent>
          </Card>

          {/* Prices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                💰 Harga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sellPrice" className="text-primary font-semibold">
                    Harga Jual / pcs (Rp) <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="sellPrice" 
                    type="number" 
                    value={sellPrice} 
                    onChange={(e) => setSellPrice(e.target.value)} 
                    placeholder="5000"
                    className="border-primary/50 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Harga Modal / pcs (Rp)</Label>
                  <Input 
                    id="basePrice" 
                    type="number" 
                    value={basePrice} 
                    onChange={(e) => setBasePrice(e.target.value)} 
                    placeholder="4037" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cratePrice">Harga per Krat (Rp)</Label>
                  <Input 
                    id="cratePrice" 
                    type="number" 
                    value={cratePrice} 
                    onChange={(e) => setCratePrice(e.target.value)} 
                    placeholder="161483"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dozenPrice">Harga per Lusin (Rp)</Label>
                  <Input 
                    id="dozenPrice" 
                    type="number" 
                    value={dozenPrice} 
                    onChange={(e) => setDozenPrice(e.target.value)} 
                    placeholder="48445"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🖼️ Foto Produk
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {imageUrl ? (
                <div className="rounded-lg border bg-muted/20 p-2 w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageUrl} 
                    alt={name} 
                    className="w-32 h-32 object-contain mix-blend-multiply" 
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/20 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 opacity-20" />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="relative overflow-hidden" 
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ganti Foto
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {uploading ? '⏳ Mengupload...' : 'Format: PNG, JPG, WEBP'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🏷️ Badge Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {BADGE_TYPES.map((b) => (
                  <button
                    key={b.type}
                    type="button"
                    onClick={() => toggleBadge(b.type)}
                    className={`px-4 py-2 rounded-full font-bold text-sm tracking-wide transition-all border-2 ${
                      activeBadges.includes(b.type)
                        ? 'text-white border-transparent ring-2 ring-offset-2 ring-offset-background opacity-100 shadow-md transform scale-105'
                        : 'text-muted-foreground border-transparent bg-muted hover:bg-muted/80'
                    }`}
                    style={{
                      ...(activeBadges.includes(b.type) && { 
                        backgroundColor: b.color,
                        //@ts-ignore Tailwind ring color override
                        '--tw-ring-color': b.color,
                      })
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg" 
              disabled={saving}
              className="w-full sm:w-auto text-md"
            >
              {saving ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
