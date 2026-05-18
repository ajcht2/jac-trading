import { useEffect, useState } from 'react'
import { Download, Share, X, Smartphone } from 'lucide-react'

// Dismissal state lives in localStorage so the prompt doesn't pester the user.
const DISMISS_KEY = 'jac_install_dismissed'
const DISMISS_DAYS = 14

function shouldShow() {
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (!dismissedAt) return true
    const elapsed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
    return elapsed > DISMISS_DAYS
  } catch {
    return true
  }
}

function dismiss() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch {}
}

// Detect the runtime so we can show the right install instructions.
function detectPlatform() {
  if (typeof window === 'undefined') return 'other'
  const ua = window.navigator.userAgent
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  if (standalone) return 'installed'
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'other'
}

export default function InstallPrompt() {
  const [platform, setPlatform] = useState('other')
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [open, setOpen] = useState(false)
  const [iosInstructionsOpen, setIosInstructionsOpen] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())

    // Chrome / Android fire this event when the app is installable.
    const handler = (e) => {
      e.preventDefault()
      setDeferredEvent(e)
      if (shouldShow()) setOpen(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS doesn't fire the event — show after a short delay if not installed.
    if (platform === 'ios' && shouldShow()) {
      const t = setTimeout(() => setOpen(true), 4000)
      return () => clearTimeout(t)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [platform])

  if (platform === 'installed' || platform === 'other') return null
  if (!open) return null

  const handleInstall = async () => {
    if (deferredEvent) {
      deferredEvent.prompt()
      const { outcome } = await deferredEvent.userChoice
      if (outcome === 'dismissed') dismiss()
      setOpen(false)
      setDeferredEvent(null)
    }
  }

  const close = () => {
    dismiss()
    setOpen(false)
    setIosInstructionsOpen(false)
  }

  return (
    <div className="fixed inset-x-3 bottom-3 sm:left-auto sm:right-3 sm:bottom-3 sm:w-[360px] z-50">
      <div className="bg-terminal-panel/95 backdrop-blur-xl border border-accent/30 rounded-2xl shadow-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent/15">
            <Smartphone size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Install JAC on your phone</p>
            <p className="text-xs text-terminal-muted mt-0.5 leading-relaxed">
              Full-screen, offline access to courses, LBO model and interview prep.
            </p>
          </div>
          <button onClick={close} className="text-terminal-muted hover:text-loss shrink-0 p-1" title="Dismiss">
            <X size={14} />
          </button>
        </div>

        {platform === 'android' && (
          <button
            onClick={handleInstall}
            disabled={!deferredEvent}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all disabled:opacity-50"
          >
            <Download size={14} /> Install app
          </button>
        )}

        {platform === 'ios' && !iosInstructionsOpen && (
          <button
            onClick={() => setIosInstructionsOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/90 text-white font-semibold text-sm transition-all"
          >
            <Download size={14} /> Show install steps
          </button>
        )}

        {platform === 'ios' && iosInstructionsOpen && (
          <div className="bg-terminal-bg/60 rounded-xl p-3 space-y-2 text-xs">
            <p className="font-semibold text-terminal-text">In Safari, do this:</p>
            <p className="flex items-center gap-2 text-terminal-text/85">
              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
              Tap <Share size={12} className="inline mx-1" /> (Share button at the bottom)
            </p>
            <p className="flex items-center gap-2 text-terminal-text/85">
              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
              Scroll and tap <span className="font-mono">"Add to Home Screen"</span>
            </p>
            <p className="flex items-center gap-2 text-terminal-text/85">
              <span className="w-5 h-5 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
              Tap <span className="font-mono">"Add"</span> in the top-right
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
