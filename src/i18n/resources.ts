import common from '../locales/en/common.json'
import translation from '../locales/en/translation.json'
import type { Namespace } from './settings'

export const resources = {
  translation,
  common,
} satisfies Record<Namespace, unknown>
