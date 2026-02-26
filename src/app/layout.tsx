import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Toko Yayuk - Walls Ice Cream',
  description: 'Showcase produk Walls Ice Cream tersedia di Toko Yayuk. Temukan berbagai varian es krim Walls dengan harga terbaik.',
  keywords: 'walls ice cream, toko yayuk, es krim, cornetto, paddle pop',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
