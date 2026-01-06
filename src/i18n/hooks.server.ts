import { use } from 'react'

import { getLocale, getTranslation } from './server'
import type { Locale, Namespace } from './settings'

export function useTranslation(ns?: Namespace) {
  const lng = getLocale()
  return use(getTranslation(lng, ns))
}

// eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- naming consistency with client
export function useLocale(): Locale {
  return getLocale()
}
