import { use } from 'react'

import { getI18nConfig, getRequestLocale } from './server'
import type { Locale, Namespace } from './settings'
import { defaultNS } from './settings'

export function useTranslation(ns: Namespace = defaultNS) {
  const lng = getRequestLocale()
  const config = use(getI18nConfig(lng, ns))

  return {
    t: config.t,
    i18n: config.i18n,
  }
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- naming consistency with client
export function useLocale(): Locale {
  return getRequestLocale()
}
