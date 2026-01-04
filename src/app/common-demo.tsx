import { useTranslation } from '#i18n/useTranslation'

export function CommonDemo() {
  const { t } = useTranslation('common')

  return (
    <div style={{ padding: '1rem', border: '1px solid orange', margin: '1rem 0' }}>
      <h3>Common Namespace</h3>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button>{t('save')}</button>
        <button>{t('cancel')}</button>
        <button>{t('confirm')}</button>
        <span>{t('loading')}</span>
      </div>
    </div>
  )
}
