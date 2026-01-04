'use client'

import type { Locale } from '#i18n/settings'
import { languages, LOCALE_COOKIE } from '#i18n/settings'
import { useTranslation } from '#i18n/useTranslation'
import { useRouter } from 'next/navigation'

const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
}

interface LanguageSwitcherProps {
  currentLocale: Locale
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter()
  const { t } = useTranslation()

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    // Refresh the page to apply new locale
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
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
