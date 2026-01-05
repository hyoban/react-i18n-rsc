'use client'

import { useTransition } from 'react'
import { useRouter } from 'waku'

import type { Locale } from '#i18n/settings'
import { languages, LOCALE_COOKIE } from '#i18n/settings'
import { useTranslation } from '#i18n/useTranslation'

const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLocaleChange = (newLocale: Locale) => {
    // eslint-disable-next-line unicorn/no-document-cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    startTransition(async () => {
      await i18n.changeLanguage(newLocale)
      router.reload()
    })
  }

  const currentLocale = i18n.language as Locale

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', opacity: isPending ? 0.7 : 1 }}>
      <span>
        {t('Language')}
        :
        {' '}
      </span>
      {languages.map((locale) => {
        const isActive = locale === currentLocale

        return (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            disabled={isPending}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: 'none',
              cursor: isPending ? 'wait' : 'pointer',
              backgroundColor: isActive ? '#0070f3' : '#eaeaea',
              color: isActive ? 'white' : 'black',
              fontWeight: isActive ? 'bold' : 'normal',
            }}
          >
            {localeNames[locale]}
          </button>
        )
      })}
    </div>
  )
}
