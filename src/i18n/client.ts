import type { i18n, Resource } from 'i18next'
import type { Locale, Messages } from './settings'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { getInitOptions } from './settings'

function getBackend() {
  return {
    type: 'backend' as const,
    init() {},
    read(language: string, namespace: string, callback: (err: unknown, data?: unknown) => void) {
      import(`../locales/${language}/${namespace}.json`)
        .then(data => callback(null, data.default ?? data))
        .catch(callback)
    },
  }
}

export function createClientI18nInstanceSync(
  lng: Locale,
  messages: Messages,
): i18n {
  const instance = createInstance()

  const resources: Resource = {
    [lng]: messages,
  }

  instance
    .use(initReactI18next)
    .use(getBackend())
    .init({
      ...getInitOptions(lng),
      resources,
      partialBundledLanguages: true,
    })

  return instance
}

export function createClientI18nInstanceAsync(lng: Locale): {
  instance: i18n
  ready: Promise<void>
} {
  const instance = createInstance()

  const ready = instance
    .use(initReactI18next)
    .use(getBackend())
    .init(getInitOptions(lng))
    .then(() => undefined)

  return { instance, ready }
}
