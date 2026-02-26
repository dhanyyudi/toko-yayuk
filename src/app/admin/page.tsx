'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProductFull } from '@/types/database'
import { getWallsProducts, getPriceByType } from '@/lib/data'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LogOut, Plus, Pencil, Eye } from 'lucide-react'

function formatRp(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`
}

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductFull[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
      const data = await getWallsProducts()
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-muted/40">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">
        <div className="flex items-center gap-2 font-semibold">
          <span className="text-2xl">🍦</span>
          <span className="hidden sm:inline-block tracking-tight">Toko Yayuk Admin</span>
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
            {userEmail}
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Eye className="mr-2 h-4 w-4" />
              Lihat Showcase
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Daftar Produk Toko Yayuk</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola produk Walls, harga, dan informasinya ({products.length} produk)
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk Baru
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-24 text-muted-foreground">
            Sedang memuat data produk...
          </div>
        ) : (
          <div className="border rounded-lg bg-background shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[300px]">Produk</TableHead>
                  <TableHead>Kode</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Per Krat</TableHead>
                  <TableHead>Per Lusin</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Belum ada produk.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const sellPrice = getPriceByType(product, 'sell_piece')
                    const cratePrice = getPriceByType(product, 'crate')
                    const dozenPrice = getPriceByType(product, 'dozen')
                    const badges = product.product_badges || []
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{product.code || '—'}</TableCell>
                        <TableCell className="font-semibold text-primary">
                          {sellPrice ? formatRp(sellPrice) : '—'}
                        </TableCell>
                        <TableCell>{cratePrice ? formatRp(cratePrice) : '—'}</TableCell>
                        <TableCell>{dozenPrice ? formatRp(dozenPrice) : '—'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {badges.map((b) => (
                              <span 
                                key={b.id} 
                                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                                style={{
                                  backgroundColor: b.badge_type === 'BARU' ? '#E8001A' : b.badge_type === 'BEST_SELLER' ? '#FF6B35' : '#7C3AED'
                                }}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  )
}
