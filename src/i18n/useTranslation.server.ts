import type { Namespace } from './settings'
import { use } from 'react'
import { getI18nConfig, getRequestLocale } from './server'
import { defaultNS } from './settings'

export function useTranslation(ns: Namespace | Namespace[] = defaultNS) {
  const lng = getRequestLocale()
  const config = use(getI18nConfig(lng, ns))

  return {
    t: config.t,
    i18n: config.i18n,
  }
}
