// SVG logo — matches the actual Deem Creative brand mark:
// white D ring + navy outer play triangle + white stroked inner play triangle

export function DeemCreativeMark({ className = '', style = {} }) {
  return (
    <svg
      viewBox="0 0 60 78"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Deem Creative"
      role="img"
    >
      {/* White D ring — outer D shape minus inner counter */}
      <path
        fillRule="evenodd"
        fill="white"
        d="M8,4 L8,74 L30,74 Q54,74 54,39 Q54,4 30,4 Z
           M18,14 L29,14 Q43,14 43,39 Q43,64 29,64 L18,64 Z"
      />
      {/* Navy outer play triangle */}
      <polygon points="22,23 22,55 44,39" fill="#0D3472" />
      {/* White inner play triangle (stroke only — the smaller nested triangle) */}
      <polygon
        points="26,30 26,48 38,39"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DeemCreativeLogoFull({ className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <svg
        viewBox="0 0 60 78"
        xmlns="http://www.w3.org/2000/svg"
        className="h-20 md:h-24 w-auto"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          fill="white"
          d="M8,4 L8,74 L30,74 Q54,74 54,39 Q54,4 30,4 Z
             M18,14 L29,14 Q43,14 43,39 Q43,64 29,64 L18,64 Z"
        />
        <polygon points="22,23 22,55 44,39" fill="#0D3472" />
        <polygon
          points="26,30 26,48 38,39"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="text-white font-bold tracking-wide"
        style={{ fontSize: '1.6rem', fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.02em' }}
      >
        Deem Creative
      </span>
    </div>
  )
}
