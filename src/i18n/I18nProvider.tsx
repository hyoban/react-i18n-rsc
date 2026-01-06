'use client'

import type { Resource } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { createClientI18nInstanceSync } from './client'
import type { Locale } from './settings'

interface I18nProviderProps {
  children: ReactNode
  locale: Locale
  resources: Resource
  fallback?: ReactNode
}

export function I18nProvider({
  children,
  locale,
  resources,
}: I18nProviderProps) {
  console.info('Creating i18n instance in client for', locale)
  const i18n = createClientI18nInstanceSync(locale, resources)
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
