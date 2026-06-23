'use client'

import { useEffect, useState } from 'react'

import { X } from 'lucide-react'

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

function SideAd({ position }: { position: 'left' | 'right' }) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div
      className={`fixed top-1/2 z-40 hidden h-[400px] w-[140px] -translate-y-1/2 xl:block ${position === 'left' ? 'left-2' : 'right-2'}`}
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '140px', height: '400px' }}
        data-ad-client="ca-pub-4635205784488672"
        data-ad-slot="2253151441"
        data-ad-format="auto"
        data-full-width-responsive="false"
        data-adtest="on"
      />
    </div>
  )
}

function BottomAd({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [])

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm xl:hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="min-w-0 flex-1 overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '60px' }}
            data-ad-client="ca-pub-4635205784488672"
            data-ad-slot="3238361838"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
            data-adtest="on"
          />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:text-white/60"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function AdBanner() {
  const [isPremium, setIsPremium] = useState<boolean | null>(null)
  const [bottomClosed, setBottomClosed] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setIsPremium(data?.isPremium ?? false))
      .catch(() => setIsPremium(false))
  }, [])

  if (isPremium === null || isPremium) return null

  return (
    <>
      <SideAd position="left" />
      <SideAd position="right" />
      {!bottomClosed && <BottomAd onClose={() => setBottomClosed(true)} />}
    </>
  )
}
