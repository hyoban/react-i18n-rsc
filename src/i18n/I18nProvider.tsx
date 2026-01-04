'use client'

import type { ReactNode } from 'react'
import type { Locale, Messages } from './settings'
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createClientI18nInstanceAsync, createClientI18nInstanceSync } from './client'
import { fallbackLng } from './settings'

interface I18nProviderProps {
  children: ReactNode
  locale: Locale
  messages?: Messages | null
  fallback?: ReactNode
}

export function I18nProvider({
  children,
  locale,
  messages,
  fallback = null,
}: I18nProviderProps) {
  if (messages) {
    return (
      <I18nProviderSync locale={locale} messages={messages}>
        {children}
      </I18nProviderSync>
    )
  }

  return (
    <I18nProviderAsync locale={locale} fallback={fallback}>
      {children}
    </I18nProviderAsync>
  )
}

function I18nProviderSync({
  children,
  locale,
  messages,
}: {
  children: ReactNode
  locale: Locale
  messages: Messages
}) {
  const i18nInstance = useMemo(
    () => createClientI18nInstanceSync(locale, messages),
    [locale, messages],
  )

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}

function I18nProviderAsync({
  children,
  locale,
  fallback,
}: {
  children: ReactNode
  locale: Locale
  fallback: ReactNode
}) {
  const storeRef = useRef({ isReady: false, locale: fallbackLng, listeners: new Set<() => void>() })
  const store = storeRef.current

  const i18nInstance = useMemo(() => {
    const { instance } = createClientI18nInstanceAsync(fallbackLng)
    return instance
  }, [])

  useEffect(() => {
    if (store.locale === locale && i18nInstance.isInitialized) {
      store.isReady = true
      store.listeners.forEach(l => l())
      return
    }

    store.isReady = false
    store.listeners.forEach(l => l())

    i18nInstance.changeLanguage(locale).then(() => {
      store.locale = locale
      store.isReady = true
      store.listeners.forEach(l => l())
    })
  }, [locale, store, i18nInstance])

  const ready = useSyncExternalStore(
    (callback) => {
      store.listeners.add(callback)
      return () => store.listeners.delete(callback)
    },
    () => store.isReady,
    () => false,
  )

  if (!ready) {
    return <>{fallback}</>
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
