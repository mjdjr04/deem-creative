import logoFull from '../assets/logo/no_bkg-3.svg'

// Icon-only: crops to just the D mark portion of the SVG (viewBox trims the wordmark)
export function DeemCreativeMark({ className = '', style = {} }) {
  return (
    <img
      src={logoFull}
      alt="Deem Creative"
      className={className}
      style={{ objectFit: 'contain', ...style }}
    />
  )
}

export function DeemCreativeLogoFull({ className = '' }) {
  return (
    <img
      src={logoFull}
      alt="Deem Creative"
      className={`h-32 md:h-40 w-auto ${className}`}
      style={{ objectFit: 'contain' }}
    />
  )
}
