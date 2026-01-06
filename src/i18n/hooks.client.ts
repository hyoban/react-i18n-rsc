'use client'

import { useTranslation as useTranslationOriginal } from 'react-i18next'

import type { Locale, Namespace } from './settings'

export function useTranslation(ns?: Namespace) {
  return useTranslationOriginal(ns)
}

export function useLocale(): Locale {
  const { i18n } = useTranslationOriginal()
  return i18n.language as Locale
}
