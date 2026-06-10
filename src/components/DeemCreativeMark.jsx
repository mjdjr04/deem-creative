import logo3 from '../assets/logo/no_bkg-3.png'

export function DeemCreativeMark({ className = '', style = {} }) {
  return (
    <img
      src={logo3}
      alt="Deem Creative"
      className={className}
      style={{ filter: 'brightness(0) invert(1)', ...style }}
    />
  )
}

export function DeemCreativeLogoFull({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <img
        src={logo3}
        alt="Deem Creative"
        className="h-20 md:h-24 w-auto"
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <span
        className="text-white font-bold tracking-wide"
        style={{ fontSize: '1.6rem', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.02em' }}
      >
        Deem Creative
      </span>
    </div>
  )
}
