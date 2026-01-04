'use client'

import { useTranslation } from '#i18n/useTranslation'

export function ClientDemo() {
  const { t } = useTranslation()

  return (
    <div style={{ padding: '1rem', border: '1px solid blue', margin: '1rem 0' }}>
      <h3>{t('Client Component')}</h3>
      <p>{t('Welcome to React')}</p>
    </div>
  )
}
