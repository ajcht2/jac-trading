import { useState } from 'react'
import { Play } from 'lucide-react'

// Extracts a video ID from a full YouTube URL or returns the input if it
// already looks like a raw ID. Accepts:
//   - https://www.youtube.com/watch?v=ID
//   - https://youtu.be/ID
//   - https://www.youtube.com/embed/ID
//   - bare ID
function parseVideoId(input) {
  if (!input) return null
  // Already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input
  try {
    const url = new URL(input)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1)
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      const m = url.pathname.match(/^\/(embed|shorts)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {}
  return null
}

// Lazy YouTube embed:
//   - Renders just the thumbnail + a play button until clicked.
//   - On click, swaps in an iframe with autoplay so the user gets one frame
//     to first interaction.
//   - 16:9 responsive (aspect-video). Uses youtube-nocookie to avoid
//     dropping tracking cookies before the user opts in.
export default function YouTubeEmbed({ video, title, channel }) {
  const videoId = parseVideoId(video)
  const [loaded, setLoaded] = useState(false)

  if (!videoId) return null

  // Once clicked, swap in the iframe. preconnect happens at click time via
  // the browser's normal request → keeps the cold page light.
  if (loaded) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'YouTube video'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    )
  }

  // Idle state — just an image and a play button. No iframe, no JS from YT.
  return (
    <button
      type="button"
      onClick={() => setLoaded(true)}
      className="group relative w-full aspect-video rounded-2xl overflow-hidden bg-black block cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50"
      aria-label={title ? `Play "${title}"` : 'Play YouTube video'}
    >
      {/* Thumbnail. hqdefault is guaranteed to exist for every video, even
          short or old ones. maxresdefault would 404 about 15% of the time. */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt={title || ''}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
      />

      {/* Darken so the play button stays visible against light thumbnails */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60 group-hover:bg-black/25 transition-colors" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-500 group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <Play size={28} className="text-white ml-1" fill="white" strokeWidth={0} />
        </div>
      </div>

      {/* Title / channel overlay (only if provided) */}
      {(title || channel) && (
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-left">
          {title && <p className="text-sm sm:text-base font-semibold text-white leading-tight line-clamp-2">{title}</p>}
          {channel && <p className="text-[11px] sm:text-xs text-white/70 mt-1">{channel}</p>}
        </div>
      )}
    </button>
  )
}
