'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getImageUrl } from '@/lib/supabase'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Upload, ImageIcon } from 'lucide-react'

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [cratePrice, setCratePrice] = useState('')
  const [dozenPrice, setDozenPrice] = useState('')
  const [packQty, setPackQty] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreviewUrl(URL.createObjectURL(f))
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // 1. Get Category ID (assuming 'Walls' exists)
    const { data: cat } = await supabase.from('categories').select('id').limit(1).single()
    const categoryId = cat?.id || 1

    // 2. Insert Product
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
    const { data: newProd, error: prodErr } = await supabase.from('products').insert({
      name,
      description,
      category_id: categoryId,
      slug,
      code: 'PRD-' + Date.now().toString().slice(-6),
      status: 'active'
    }).select().single()

    if (prodErr || !newProd) {
      alert('Gagal membuat produk: ' + (prodErr?.message || ''))
      setSaving(false)
      return
    }

    const productId = newProd.id

    // 3. Insert Variant
    const { data: newVar } = await supabase.from('product_variants').insert({
      product_id: productId,
      sku: 'SKU-' + Date.now().toString().slice(-6),
      pack_qty: Number(packQty) || null,
      is_default: true,
      status: 'active'
    }).select().single()

    // 4. Insert Prices
    if (newVar) {
      const priceUpdates = [
        { type: 'sell_piece', value: sellPrice },
        { type: 'base_piece', value: basePrice },
        { type: 'crate', value: cratePrice },
        { type: 'dozen', value: dozenPrice },
      ]

      const pricesToInsert = priceUpdates
        .filter(p => p.value)
        .map(p => ({
          variant_id: newVar.id,
          price_type: p.type,
          amount: Number(p.value),
          currency: 'IDR',
          is_active: true
        }))

      if (pricesToInsert.length > 0) {
        await supabase.from('product_prices').insert(pricesToInsert)
      }
    }

    // 5. Upload Image and Insert Media
    if (file) {
      const ext = file.name.split('.').pop()
      const filePath = `${productId}/primary.${ext}`
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(filePath, file, { upsert: true })
      
      if (!uploadErr) {
        const url = getImageUrl(filePath)
        await supabase.from('product_media').insert({
          product_id: productId,
          url,
          alt_text: name,
          is_primary: true,
          sort_order: 0,
        })
      }
    }

    setSaving(false)
    router.push('/admin') // Kembali ke daftar produk
  }

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
          <span className="text-xl tracking-tight">Tambah Produk Baru</span>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-3xl mx-auto">
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
                  placeholder="Contoh: Paddle Pop Choco Magma" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi (opsional)</Label>
                <Textarea 
                  id="description" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Deskripsi singkat produk..."
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
                    required 
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
                    placeholder="4000" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cratePrice">Harga per Krat (Rp)</Label>
                  <Input 
                    id="cratePrice" 
                    type="number" 
                    value={cratePrice} 
                    onChange={(e) => setCratePrice(e.target.value)} 
                    placeholder="160000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dozenPrice">Harga per Lusin (Rp)</Label>
                  <Input 
                    id="dozenPrice" 
                    type="number" 
                    value={dozenPrice} 
                    onChange={(e) => setDozenPrice(e.target.value)} 
                    placeholder="48000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                🖼️ Foto Produk <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewUrl ? (
                <div className="rounded-lg border bg-muted/20 p-2 w-fit">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-32 h-32 object-contain mix-blend-multiply" 
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/20 text-muted-foreground">
                  <ImageIcon className="w-8 h-8 opacity-20" />
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" className="relative overflow-hidden">
                  <Upload className="w-4 h-4 mr-2" />
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Format: PNG, JPG, WEBP
                </span>
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
                'Memproses...'
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Produk Baru
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
