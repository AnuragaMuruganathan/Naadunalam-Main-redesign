/** Hand-drawn style leaf glyph used as an ornament across sections. */
export function Leaf({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 48 32"
      aria-hidden
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <defs>
        <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7bb342" />
          <stop offset="1" stopColor="#2e7d32" />
        </linearGradient>
      </defs>
      <path d="M4 26C10 8 30 2 46 4c-2 16-18 28-38 24" fill="url(#leafG)" />
      <path d="M6 27C16 20 28 12 42 7" stroke="#e8f5d0" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Small ornament: line + leaf, as flanking the "Shop by Category" title. */
export function LeafRule({ flip = false }: { flip?: boolean }) {
  return (
    <span aria-hidden className={`flex items-center ${flip ? "flex-row-reverse" : ""}`}>
      <span className="h-px w-4 bg-forest-600 sm:w-8 md:w-14" />
      <svg viewBox="0 0 30 18" className={`h-4 w-7 fill-forest-600 ${flip ? "-scale-x-100" : ""}`}>
        <path d="M2 10c6-8 18-10 26-6-4 8-16 12-26 6Z" />
        <path d="M2 10c8-1 16-3 24-5" stroke="#fcf5ed" strokeWidth="1" fill="none" />
      </svg>
    </span>
  );
}
