import type { Namespace } from './settings'
import common from '../locales/en/common.json'
import translation from '../locales/en/translation.json'

export const resources = {
  translation,
  common,
} satisfies Record<Namespace, unknown>
