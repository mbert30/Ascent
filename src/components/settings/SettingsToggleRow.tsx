'use client'

import { Switch } from '@/components/ui/switch'

import { cn } from '@/lib/utils'

type SettingsToggleRowProps = {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

export function SettingsToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: SettingsToggleRowProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-4 py-3', className)}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block text-sm font-medium text-white">
          {label}
        </label>
        {description ? (
          <p className="mt-0.5 text-xs text-white/60">{description}</p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-violet-500"
      />
    </div>
  )
}
