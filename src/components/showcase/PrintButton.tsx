'use client'

import { useRef } from 'react'

export function PrintButton() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="print-toolbar">
      <button onClick={handlePrint} className="btn-print">
        🖨️ Print / PDF
      </button>
    </div>
  )
}
