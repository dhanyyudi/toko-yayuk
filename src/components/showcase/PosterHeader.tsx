import Image from 'next/image'

export function PosterHeader() {
  return (
    <header className="poster-header">
      <div className="header-left">
        <div className="walls-logo">
          <Image
            src="/walls-logo.png"
            alt="Walls Logo"
            width={80}
            height={80}
            className="logo-img"
            onError={() => {}}
          />
        </div>
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
  )
}
