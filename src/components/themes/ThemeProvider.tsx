'use client'

import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { DEFAULT_THEME_ID } from '@/lib/themes/definitions'

type ThemeContextValue = {
  themeId: string
  unlockedThemeIds: string[]
  setThemeId: (id: string) => void
  setUnlockedThemeIds: (ids: string[]) => void
  refreshTheme: () => Promise<void>
  loading: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState(DEFAULT_THEME_ID)
  const [unlockedThemeIds, setUnlockedThemeIds] = useState<string[]>([
    DEFAULT_THEME_ID,
  ])
  const [loading, setLoading] = useState(true)

  const refreshTheme = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me')
      if (!res.ok) return
      const data = await res.json()
      if (typeof data.themeId === 'string') {
        setThemeIdState(data.themeId)
      }
      if (Array.isArray(data.unlockedThemeIds)) {
        setUnlockedThemeIds(data.unlockedThemeIds)
      }
    } catch {
      // keep defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch('/api/user/me')
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return
        if (typeof data.themeId === 'string') {
          setThemeIdState(data.themeId)
        }
        if (Array.isArray(data.unlockedThemeIds)) {
          setUnlockedThemeIds(data.unlockedThemeIds)
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const setThemeId = useCallback((id: string) => {
    setThemeIdState(id)
  }, [])

  const value = useMemo(
    () => ({
      themeId,
      unlockedThemeIds,
      setThemeId,
      setUnlockedThemeIds,
      refreshTheme,
      loading,
    }),
    [themeId, unlockedThemeIds, setThemeId, refreshTheme, loading]
  )

  return (
    <ThemeContext.Provider value={value}>
      <div
        data-ascent-theme={themeId}
        className="bg-ascent-bg text-ascent-text min-h-screen"
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useAscentTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useAscentTheme must be used within ThemeProvider')
  }
  return ctx
}
