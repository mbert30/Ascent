import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { LandingPage } from '@/components/landing/LandingPage'

type PageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing.meta' })

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: [
        { url: '/icon-512.png', width: 512, height: 512, alt: 'Ascent' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['/icon-512.png'],
    },
  }
}

export default function Home() {
  return <LandingPage />
}
