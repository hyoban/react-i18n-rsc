import type { i18n, TFunction } from 'i18next'
import { createInstance } from 'i18next'
import { cache } from 'react'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { unstable_getContextData as getContextData } from 'waku/server'

import type { Locale, Messages, Namespace } from './settings'
import { defaultNS, fallbackLng, getInitOptions, namespaces } from './settings'

// Request-level locale cache
interface LocaleCache {
  locale?: Locale
}

const getLocaleCache = cache((): LocaleCache => ({}))

export function setRequestLocale(locale: Locale): void {
  getLocaleCache().locale = locale
}

export function getRequestLocale(): Locale {
  return getLocaleCache().locale ?? fallbackLng
}

export async function getLocaleFromCookies(): Promise<Locale> {
  const data = getContextData() as { locale?: Locale }
  return data.locale ?? fallbackLng
}

// Messages loading
export const getMessages = cache(async (lng: Locale, ns?: Namespace[]): Promise<Messages> => {
  const messages = {} as Messages

  await Promise.all(
    (ns ?? namespaces).map(async (ns) => {
      const module = await import(`../locales/${lng}/${ns}.json`)
      messages[ns] = module.default
    }),
  )

  return messages
})

// i18next instance
async function createServerI18nInstance(lng: Locale, messages: Messages): Promise<i18n> {
  const instance = createInstance()

  await instance
    .use(initReactI18next)
    .init({
      ...getInitOptions(lng),
      resources: { [lng]: messages },
    })

  return instance
}

const getI18nextInstance = cache(async (lng: Locale) => {
  const messages = await getMessages(lng)
  return createServerI18nInstance(lng, messages)
})

export async function getTranslation(
  lng: Locale,
  ns: Namespace | Namespace[] = defaultNS,
): Promise<{ t: TFunction, i18n: i18n }> {
  const i18nInstance = await getI18nextInstance(lng)
  return {
    t: i18nInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns),
    i18n: i18nInstance,
  }
}

export const getI18nConfig = cache(async (lng: Locale, ns: Namespace | Namespace[] = defaultNS) => {
  const i18nInstance = await getI18nextInstance(lng)
  return {
    i18n: i18nInstance,
    t: i18nInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns),
    lng,
    ns,
  }
})
