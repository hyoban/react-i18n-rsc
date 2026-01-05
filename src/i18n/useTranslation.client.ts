'use client'

import { useTranslation as useTranslationOriginal } from 'react-i18next'

import type { Namespace } from './settings'

export function useTranslation(ns?: Namespace | Namespace[]) {
  return useTranslationOriginal(ns)
}
