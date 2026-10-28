export const BANNER_TEXT = 'Teaching demo — synthetic data only.'

export function Banner() {
  return (
    <header
      aria-label="Teaching demo notice"
      className="sticky top-0 z-50 border-b border-amber-700/60 bg-amber-950/95 px-4 py-2 text-center text-sm font-medium text-amber-100 backdrop-blur"
    >
      {BANNER_TEXT}
    </header>
  )
}
