export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'zh'] as const
export const namespaces = ['translation', 'common'] as const
export const defaultNS = namespaces[0]

export type Locale = (typeof languages)[number]
export type Namespace = (typeof namespaces)[number]
export type Messages = Record<Namespace, Record<string, unknown>>

export function getInitOptions(lng: Locale) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespaces,
  } as const
}
