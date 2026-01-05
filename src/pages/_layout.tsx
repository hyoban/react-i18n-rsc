import type { ReactNode } from 'react'

import { getLocaleFromCookies, getMessages, setRequestLocale } from '#i18n/server'

import { I18nProvider } from '../i18n/I18nProvider'

const globalStyles = `
  :root {
    --background: #ffffff;
    --foreground: #171717;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --background: #0a0a0a;
      --foreground: #ededed;
    }
    html {
      color-scheme: dark;
    }
  }
  html, body {
    max-width: 100vw;
    overflow-x: hidden;
  }
  body {
    color: var(--foreground);
    background: var(--background);
    font-family: Arial, Helvetica, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
`

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const locale = await getLocaleFromCookies()
  setRequestLocale(locale)

  const messages = await getMessages(locale)

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Waku i18n Demo</title>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}

export async function getConfig() {
  return {
    render: 'dynamic',
  } as const
}
