import { useTranslation } from '#i18n/useTranslation'

export function ServerDemo() {
  const { t } = useTranslation()

  return (
    <div style={{ padding: '1rem', border: '1px solid green', margin: '1rem 0' }}>
      <h3>{t('Server Component')}</h3>
      <p>{t('Welcome to React')}</p>
    </div>
  )
}
