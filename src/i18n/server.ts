import type { Resource, ResourceLanguage } from 'i18next'
import { createInstance } from 'i18next'
import { cache } from 'react'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { unstable_getContextData as getContextData } from 'waku/server'

import { serverOnlyContext } from './server-only-context'
import type { Locale, Namespace } from './settings'
import { fallbackLng, getInitOptions, namespaces } from './settings'

export const [getLocale, setLocale] = serverOnlyContext<Locale>(fallbackLng)

export async function getLocaleFromCookies(): Promise<Locale> {
  const data = getContextData() as { locale?: Locale }
  return data.locale ?? fallbackLng
}

export const getResources = cache(async (lng: Locale): Promise<Resource> => {
  const messages = {} as ResourceLanguage

  await Promise.all(
    namespaces.map(async (ns) => {
      const module = await import(`../locales/${lng}/${ns}.json`)
      messages[ns] = module.default
    }),
  )

  console.info('Loaded resources for', lng, namespaces, 'in server')

  return { [lng]: messages }
})

const getI18n = cache(async (lng: Locale) => {
  const resources = await getResources(lng)
  const instance = createInstance()

  await instance
    .use(initReactI18next)
    .init({
      ...getInitOptions(lng),
      resources,
    })

  return instance
})

export const getTranslation = cache(async (lng: Locale, ns?: Namespace) => {
  const i18n = await getI18n(lng)
  return {
    i18n,
    t: i18n.getFixedT(lng, ns),
  }
})
