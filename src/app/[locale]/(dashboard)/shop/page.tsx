'use client'

import { useEffect, useMemo, useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import {
  ArrowLeft,
  Coins,
  Pencil,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { SHOP_EXAMPLE_REWARDS } from '@/data/shop'

export default function ShopPage() {
  const t = useTranslations('shop')
  const locale = useLocale()
  const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale])

  const [balance, setBalance] = useState<number | null>(null)
  const [rewards, setRewards] = useState<
    Array<{
      id: string
      title: string
      cost: number
      icon: string | null
      type: string
      isEditable: boolean
    }>
  >([])
  const [history, setHistory] = useState<
    Array<{
      id: string
      title: string
      cost: number
      icon?: string | null
      purchasedAt: string
    }>
  >([])
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState(300)
  const [icon, setIcon] = useState('🎁')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCost, setEditCost] = useState(0)
  const [editIcon, setEditIcon] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadRewardsData = async () => {
    await fetch('/api/rewards')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setBalance(data.balance ?? 0)
          setRewards(data.rewards ?? [])
          setHistory(data.history ?? [])
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    loadRewardsData()
  }, [])

  const handleRedeem = async (reward: {
    id: string
    title: string
    cost: number
    icon: string | null
    titleKey?: string
    rewardId?: string
  }) => {
    setRedeeming(reward.id)
    setMessage(null)
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rewardId: reward.rewardId,
          title: reward.titleKey ? t(reward.titleKey) : reward.title,
          cost: reward.cost,
          icon: reward.icon,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(
          data?.error === 'INSUFFICIENT_GOLD'
            ? t('notEnoughGold')
            : t('redeemFailed')
        )
        return
      }
      setBalance(data.balance ?? balance ?? 0)
      setMessage(
        t('redeemSuccess', {
          title: reward.titleKey ? t(reward.titleKey) : reward.title,
        })
      )
      await loadRewardsData()
    } finally {
      setRedeeming(null)
    }
  }

  const handleCreateReward = async () => {
    setCreating(true)
    setMessage(null)
    try {
      const createRes = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          cost,
          icon: icon.trim() || null,
          type: 'REAL_LIFE',
        }),
      })
      if (!createRes.ok) {
        setMessage(t('createFailed'))
        return
      }
      setTitle('')
      setCost(300)
      setIcon('🎁')
      setMessage(t('createSuccess'))
      await loadRewardsData()
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (reward: {
    id: string
    title: string
    cost: number
    icon: string | null
  }) => {
    setEditingId(reward.id)
    setEditTitle(reward.title)
    setEditCost(reward.cost)
    setEditIcon(reward.icon ?? '')
    setMessage(null)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSavingEdit(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/rewards/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          cost: editCost,
          icon: editIcon.trim() || null,
        }),
      })

      if (!res.ok) {
        setMessage(t('updateFailed'))
        return
      }

      setEditingId(null)
      setMessage(t('updateSuccess'))
      await loadRewardsData()
    } finally {
      setSavingEdit(false)
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    setDeletingId(rewardId)
    setMessage(null)
    try {
      const res = await fetch(`/api/rewards/${rewardId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setMessage(
          data?.error === 'HAS_REDEMPTIONS'
            ? t('deleteHasRedemptions')
            : t('deleteFailed')
        )
        return
      }

      if (editingId === rewardId) {
        setEditingId(null)
      }
      setMessage(t('deleteSuccess'))
      await loadRewardsData()
    } finally {
      setDeletingId(null)
    }
  }

  const customRewards = rewards.filter((reward) => reward.isEditable)

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[420px] rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute top-1/3 right-[-10%] size-[380px] rounded-full bg-yellow-500/15 blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {locale.startsWith('fr') ? 'Tableau de bord' : 'Dashboard'}
            </Link>
          </div>

          <header className="space-y-2">
            <h1 className="flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
              <ShoppingBag className="h-8 w-8 text-amber-400" />
              {t('title')}
            </h1>
            <p className="max-w-2xl text-white/70">{t('subtitle')}</p>
          </header>

          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 backdrop-blur-xl">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
              <span className="text-sm font-medium text-white/80">
                {t('balance')}
              </span>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="text-xl font-bold text-amber-200">
                  {balance !== null ? numberFormatter.format(balance) : '—'}
                </span>
                <span className="text-sm text-white/60">{t('goldUnit')}</span>
              </div>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t('ideasTitle')}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {t('ideasDescription')}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SHOP_EXAMPLE_REWARDS.map((reward) => (
                <Card
                  key={reward.id}
                  className="border-white/10 bg-white/[0.04] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-2xl" role="img" aria-hidden>
                        {reward.icon}
                      </span>
                      <Badge
                        variant="secondary"
                        className="shrink-0 border-white/20 bg-white/10 text-xs text-white/80"
                      >
                        {t(reward.categoryKey)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white">
                      {t(reward.titleKey)}
                    </h3>
                    <p className="line-clamp-2 flex-1 text-sm text-white/60">
                      {t(reward.descriptionKey)}
                    </p>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-amber-300">
                      <Coins className="h-4 w-4" />
                      {t('costGold', {
                        cost: numberFormatter.format(reward.cost),
                      })}
                    </p>
                    <Button
                      type="button"
                      disabled={
                        redeeming === reward.id || (balance ?? 0) < reward.cost
                      }
                      onClick={() =>
                        handleRedeem({
                          id: reward.id,
                          title: t(reward.titleKey),
                          cost: reward.cost,
                          icon: reward.icon,
                          titleKey: reward.titleKey,
                        })
                      }
                      className="mt-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
                    >
                      {redeeming === reward.id ? '…' : t('redeem')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t('customTitle')}
              </h2>
              <p className="mt-1 text-sm text-white/60">
                {t('customDescription')}
              </p>
            </div>
            <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
              <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('customTitlePlaceholder')}
                  className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
                <Input
                  type="number"
                  min={0}
                  max={5000}
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value) || 0)}
                  className="border-white/20 bg-white/10 text-white"
                />
                <div className="flex gap-2">
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🎁"
                    className="border-white/20 bg-white/10 text-white"
                  />
                  <Button
                    type="button"
                    onClick={handleCreateReward}
                    disabled={creating || !title.trim()}
                    className="gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                  >
                    <Plus className="h-4 w-4" />
                    {t('create')}
                  </Button>
                </div>
              </CardContent>
            </Card>
            {message && <p className="text-sm text-white/70">{message}</p>}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              {t('myRewardsTitle')}
            </h2>
            {customRewards.length === 0 ? (
              <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="py-5 text-sm text-white/60">
                  {t('myRewardsEmpty')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {customRewards.map((reward) => {
                  const isEditing = editingId === reward.id
                  return (
                    <Card
                      key={reward.id}
                      className="border-white/10 bg-white/[0.04] backdrop-blur-xl"
                    >
                      <CardContent className="space-y-3 py-3">
                        {isEditing ? (
                          <div className="grid gap-2 sm:grid-cols-3">
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="border-white/20 bg-white/10 text-white"
                            />
                            <Input
                              type="number"
                              min={0}
                              max={5000}
                              value={editCost}
                              onChange={(e) =>
                                setEditCost(Number(e.target.value) || 0)
                              }
                              className="border-white/20 bg-white/10 text-white"
                            />
                            <Input
                              value={editIcon}
                              onChange={(e) => setEditIcon(e.target.value)}
                              placeholder="🎁"
                              className="border-white/20 bg-white/10 text-white"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="text-xl" aria-hidden>
                                {reward.icon || '🎁'}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {reward.title}
                                </p>
                                <p className="text-xs text-amber-300">
                                  {t('costGold', {
                                    cost: numberFormatter.format(reward.cost),
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              redeeming === reward.id ||
                              (balance ?? 0) < reward.cost
                            }
                            onClick={() =>
                              handleRedeem({
                                id: reward.id,
                                title: reward.title,
                                cost: reward.cost,
                                icon: reward.icon,
                                rewardId: reward.id,
                              })
                            }
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 hover:opacity-95"
                          >
                            {redeeming === reward.id ? '…' : t('redeem')}
                          </Button>

                          {isEditing ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={savingEdit || !editTitle.trim()}
                                className="gap-1.5 bg-indigo-500 text-white hover:bg-indigo-400"
                              >
                                <Save className="h-4 w-4" />
                                {t('save')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setEditingId(null)}
                                className="gap-1.5"
                              >
                                <X className="h-4 w-4" />
                                {t('cancel')}
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => startEdit(reward)}
                                className="gap-1.5"
                              >
                                <Pencil className="h-4 w-4" />
                                {t('edit')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteReward(reward.id)}
                                disabled={deletingId === reward.id}
                                className="gap-1.5"
                              >
                                <Trash2 className="h-4 w-4" />
                                {t('delete')}
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-white">
              {t('historyTitle')}
            </h2>
            {history.length === 0 ? (
              <Card className="border-white/10 bg-white/[0.04] backdrop-blur-xl">
                <CardContent className="py-5 text-sm text-white/60">
                  {t('historyEmpty')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <Card
                    key={item.id}
                    className="border-white/10 bg-white/[0.04] backdrop-blur-xl"
                  >
                    <CardContent className="flex items-center justify-between gap-3 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-xl" aria-hidden>
                          {item.icon || '🎁'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-white/60">
                            {new Date(item.purchasedAt).toLocaleDateString(
                              locale,
                              {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-amber-300">
                        -{numberFormatter.format(item.cost)} {t('goldUnit')}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
