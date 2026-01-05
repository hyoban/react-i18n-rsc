import { parse } from 'cookie-es'
import type { MiddlewareHandler } from 'hono'
import { unstable_getContextData as getContextData } from 'waku/server'

import type { Locale } from '../i18n/settings'
import { fallbackLng, languages, LOCALE_COOKIE } from '../i18n/settings'

function localeMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const data = getContextData() as { locale?: Locale }
    const cookies = parse(c.req.header('cookie') || '')
    const localeCookie = cookies[LOCALE_COOKIE]

    if (localeCookie && languages.includes(localeCookie as Locale)) {
      data.locale = localeCookie as Locale
    }
    else {
      data.locale = fallbackLng
    }

    await next()
  }
}

export default localeMiddleware
