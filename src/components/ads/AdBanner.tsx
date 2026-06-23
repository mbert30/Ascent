'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { X } from 'lucide-react'

function SideAd({ position }: { position: 'left' | 'right' }) {
  return (
    <div
      className={`fixed top-1/2 z-40 hidden h-[400px] w-[140px] -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm xl:flex ${position === 'left' ? 'left-2' : 'right-2'}`}
    >
      <span className="text-[10px] tracking-widest text-white/30 uppercase">
        Pub
      </span>
      <div className="flex flex-col items-center gap-3 px-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-500/40 text-2xl">
          🚀
        </div>
        <p className="text-xs font-semibold text-white/70">
          Boostez votre productivité
        </p>
        <p className="text-[11px] text-white/40">
          Découvrez nos outils premium
        </p>
        <Link
          href="#"
          className="mt-1 rounded-lg border border-indigo-400/30 bg-indigo-500/20 px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-500/30"
        >
          En savoir plus
        </Link>
      </div>
      <span className="mt-auto mb-1 text-[9px] text-white/20">
        Annonce simulée
      </span>
    </div>
  )
}

function BottomAd({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-white/10 bg-slate-900/95 backdrop-blur-sm xl:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/40 to-purple-500/40 text-lg">
          🚀
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white/80">
            Boostez votre productivité
          </p>
          <p className="truncate text-[11px] text-white/40">
            Découvrez nos outils premium
          </p>
        </div>
        <Link
          href="#"
          className="shrink-0 rounded-lg border border-indigo-400/30 bg-indigo-500/20 px-3 py-1.5 text-[11px] font-medium text-indigo-300 transition-colors hover:bg-indigo-500/30"
        >
          Voir
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 text-white/30 transition-colors hover:text-white/60"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="pb-1 text-center text-[9px] text-white/20">
        Annonce simulée
      </p>
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
