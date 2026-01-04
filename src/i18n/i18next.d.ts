import type { resources } from './resources'
import type { defaultNS } from './settings'
import 'i18next'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS
    resources: typeof resources
  }
}
