'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export function QRCodeDisplay({ url, size = 150 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    async function generate() {
      try {
        const canvas = canvasRef.current
        if (canvas) {
          await QRCode.toCanvas(canvas, url, {
            width: size,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          })
        }
        const du = await QRCode.toDataURL(url, { width: size, margin: 2 })
        setDataUrl(du)
      } catch (err) {
        console.error('QR Code generation error:', err)
      }
    }
    generate()
  }, [url, size])

  return (
    <div className="qr-code-wrapper">
      <canvas ref={canvasRef} className="qr-canvas" />
      {/* Fallback img for print */}
      {dataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={dataUrl}
          alt="QR Code"
          className="qr-print-img"
          width={size}
          height={size}
        />
      )}
      <p className="qr-label">Scan untuk melihat produk</p>
    </div>
  )
}
