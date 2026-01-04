import { getLocaleFromCookies } from '#i18n/server'
import Image from 'next/image'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { CommonDemo } from './common-demo'
import { ClientDemo } from './demo'
import styles from './page.module.css'
import { ServerDemo } from './server-demo'

export default async function Home() {
  const locale = await getLocaleFromCookies()

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>react-i18next + Next.js RSC Demo</h1>
          <LanguageSwitcher currentLocale={locale} />
          <ServerDemo />
          <ClientDemo />
          <CommonDemo />
          <p>
            Both components use the same
            {' '}
            <code>useTranslation</code>
            {' '}
            API, but
            they load different implementations based on the environment!
          </p>
        </div>
      </main>
    </div>
  )
}
