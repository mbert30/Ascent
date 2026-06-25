'use client'

import { useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'

import { TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Étape 1 — demande
  const [email, setEmail] = useState('')

  // Étape 2 — confirmation
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'VALIDATION_ERROR') {
          setError(t('auth.errors.invalidEmail'))
        } else {
          setError(t('auth.errors.serverError'))
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'INVALID_TOKEN') {
          setError(t('auth.resetPassword.errors.invalidToken'))
        } else if (data.error === 'TOKEN_EXPIRED') {
          setError(t('auth.resetPassword.errors.tokenExpired'))
        } else if (data.error === 'VALIDATION_ERROR') {
          setError(t('auth.errors.passwordTooShort'))
        } else {
          setError(t('auth.errors.resetFailed'))
        }
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
            Ascent
          </span>
        </div>
        <Card className="border-slate-200/50 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          {children}
        </Card>
      </div>
    </div>
  )

  // Étape 1 — formulaire email
  if (!token) {
    if (success) {
      return shell(
        <>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-center text-2xl font-bold">
              {t('auth.resetPassword.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md border border-green-300 bg-green-100 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                {t('auth.resetPassword.emailSent')}
              </div>
              <Button
                type="button"
                variant="ghost"
                className="w-full cursor-pointer"
                onClick={() => router.push(`/${locale}/login`)}
              >
                {t('auth.resetPassword.backToLogin')}
              </Button>
            </div>
          </CardContent>
        </>
      )
    }

    return shell(
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-center text-2xl font-bold">
            {t('auth.resetPassword.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.resetPassword.requestSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{t('auth.email')}</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full cursor-pointer"
              size="lg"
              disabled={isLoading}
            >
              {isLoading
                ? t('auth.loading')
                : t('auth.resetPassword.requestSubmit')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full cursor-pointer"
              onClick={() => router.push(`/${locale}/login`)}
              disabled={isLoading}
            >
              {t('auth.resetPassword.backToLogin')}
            </Button>
          </form>
        </CardContent>
      </>
    )
  }

  // Étape 2 — formulaire nouveau mot de passe (token présent dans l'URL)
  if (success) {
    return shell(
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-center text-2xl font-bold">
            {t('auth.resetPassword.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border border-green-300 bg-green-100 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              {t('auth.resetPassword.success')}
            </div>
            <Button
              type="button"
              className="w-full cursor-pointer"
              size="lg"
              onClick={() => router.push(`/${locale}/login`)}
            >
              {t('auth.resetPassword.backToLogin')}
            </Button>
          </div>
        </CardContent>
      </>
    )
  }

  return shell(
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-center text-2xl font-bold">
          {t('auth.resetPassword.title')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('auth.resetPassword.confirmSubtitle')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleConfirmSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-new-password">
              {t('auth.resetPassword.newPassword')}
            </Label>
            <Input
              id="reset-new-password"
              type="password"
              placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-confirm-password">
              {t('auth.resetPassword.confirmPassword')}
            </Label>
            <Input
              id="reset-confirm-password"
              type="password"
              placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full cursor-pointer"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? t('auth.loading') : t('auth.resetPassword.submit')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full cursor-pointer"
            onClick={() => router.push(`/${locale}/login`)}
            disabled={isLoading}
          >
            {t('auth.resetPassword.backToLogin')}
          </Button>
        </form>
      </CardContent>
    </>
  )
}
