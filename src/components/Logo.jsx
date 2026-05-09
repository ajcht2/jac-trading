// Calligraphy wordmark used everywhere a JAC Trading logo previously appeared.
// `size` controls the text size; `subtitle` shows a small "Trading" line under
// the main "JAC" when true (used in the larger placements like the login page).
export default function Logo({ size = 'md', className = '', subtitle = false }) {
  const sizeMap = {
    xs: { jac: 'text-3xl',  sub: 'text-[9px]'  },
    sm: { jac: 'text-4xl',  sub: 'text-[10px]' },
    md: { jac: 'text-5xl',  sub: 'text-xs'     },
    lg: { jac: 'text-7xl',  sub: 'text-sm'     },
    xl: { jac: 'text-8xl',  sub: 'text-base'   },
  }
  const s = sizeMap[size] || sizeMap.md

  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className={`font-script ${s.jac} text-terminal-text`}
        style={{ paddingBottom: '0.15em', lineHeight: 1.1 }}
      >
        JAC&nbsp;Trading
      </span>
      {subtitle && (
        <span className={`uppercase tracking-[0.4em] text-terminal-muted font-sans font-semibold ${s.sub} mt-1`}>
          Paper Trading
        </span>
      )}
    </span>
  )
}
