'use client'

import { useState } from 'react'

import { signIn } from 'next-auth/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import { Sparkles, Target, TrendingUp, Zap } from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Home() {
  const t = useTranslations()
  const router = useRouter()
  const locale = useLocale()

  const translateZodError = (message: string) => {
    if (message.includes('Invalid email')) return t('auth.errors.invalidEmail')
    if (message.includes('at least 6')) return t('auth.errors.passwordTooShort')
    return t('auth.errors.signupFailed')
  }

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setError('')
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: `/${locale}/dashboard` })
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const validateResponse = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail }),
      })

      const validateData = await validateResponse.json()

      if (!validateResponse.ok) {
        if (validateData.error === 'USE_GOOGLE_SIGNIN') {
          setError(t('auth.errors.useGoogleSignin'))
        } else {
          setError(t('auth.errors.serverError'))
        }
        setIsLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.errors.invalidCredentials'))
        setIsLoading(false)
        return
      }

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          locale,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage =
          data.error === 'EMAIL_ALREADY_EXISTS'
            ? t('auth.errors.emailExists')
            : data.error === 'VALIDATION_ERROR' && data.message
              ? translateZodError(data.message)
              : data.error === 'SERVER_ERROR'
                ? t('auth.errors.serverError')
                : t('auth.errors.signupFailed')
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      setSuccessMessage(t('auth.emailSentOnRegister'))

      const result = await signIn('credentials', {
        email: signupEmail,
        password: signupPassword,
        redirect: false,
      })

      if (result?.error) {
        setError(t('auth.errors.loginFailed'))
        setIsLoading(false)
        return
      }

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setError(t('auth.errors.serverError'))
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="grid w-full max-w-6xl items-center gap-8 lg:grid-cols-2">
        <div className="hidden space-y-8 lg:block">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <TrendingUp className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 animate-pulse text-yellow-500" />
              </div>
              <h1 className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
                Ascent
              </h1>
            </div>
            <p className="text-xl font-medium text-slate-600 dark:text-slate-300">
              {t('auth.features.title')}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {t('auth.features.description')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="space-y-2 rounded-lg border border-slate-200/50 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-indigo-200/70 hover:bg-white/80 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-indigo-700/50 dark:hover:bg-slate-800/80">
              <Target className="mb-2 h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('auth.features.setGoals.title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.features.setGoals.description')}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200/50 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-indigo-200/70 hover:bg-white/80 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-indigo-700/50 dark:hover:bg-slate-800/80">
              <Zap className="mb-2 h-6 w-6 text-yellow-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('auth.features.earnXP.title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.features.earnXP.description')}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200/50 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-indigo-200/70 hover:bg-white/80 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-indigo-700/50 dark:hover:bg-slate-800/80">
              <TrendingUp className="mb-2 h-6 w-6 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('auth.features.trackStreaks.title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.features.trackStreaks.description')}
              </p>
            </div>
            <div className="space-y-2 rounded-lg border border-slate-200/50 bg-white/50 p-4 backdrop-blur-sm transition-all hover:border-indigo-200/70 hover:bg-white/80 hover:shadow-md dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:border-indigo-700/50 dark:hover:bg-slate-800/80">
              <Sparkles className="mb-2 h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {t('auth.features.visualize.title')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t('auth.features.visualize.description')}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <Card className="border-slate-200/50 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-1 pb-6">
              <div className="mb-4 flex items-center justify-center gap-2 lg:hidden">
                <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent dark:from-indigo-400 dark:to-purple-400">
                  Ascent
                </CardTitle>
              </div>
              <CardTitle className="text-center text-2xl font-bold">
                {t('auth.welcome')}
              </CardTitle>
              <CardDescription className="text-center">
                {t('auth.subtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded-md border border-green-300 bg-green-100 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                  {successMessage}
                </div>
              )}

              <Tabs defaultValue="login" className="w-full">
                <TabsList className="mb-6 grid w-full grid-cols-2">
                  <TabsTrigger value="login">{t('auth.signIn')}</TabsTrigger>
                  <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">{t('auth.email')}</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">
                          {t('auth.password')}
                        </Label>
                        <a
                          href={`/${locale}/reset-password`}
                          className="text-xs text-indigo-600 transition-colors hover:text-indigo-800 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          {t('auth.forgotPassword')}
                        </a>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.loading') : t('auth.signIn')}
                    </Button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">
                        {t('auth.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t('auth.continueWithGoogle')}
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t('auth.emailPlaceholder')}
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">
                        {t('auth.password')}
                      </Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.passwordPlaceholder')}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? t('auth.loading') : t('auth.createAccount')}
                    </Button>
                  </form>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-slate-300 dark:border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500 dark:bg-slate-900">
                        {t('auth.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full cursor-pointer"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {t('auth.continueWithGoogle')}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
