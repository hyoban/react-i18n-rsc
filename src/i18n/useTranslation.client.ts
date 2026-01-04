'use client'

import type { Namespace } from './settings'
import { useTranslation as useTranslationOriginal } from 'react-i18next'

export function useTranslation(ns?: Namespace | Namespace[]) {
  return useTranslationOriginal(ns)
}
