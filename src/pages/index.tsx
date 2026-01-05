import type { CSSProperties } from 'react'

import { CommonDemo } from '../components/common-demo'
import { ClientDemo } from '../components/demo'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { ServerDemo } from '../components/server-demo'

const pageStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'Arial, Helvetica, sans-serif',
  backgroundColor: '#fafafa',
}

const mainStyle: CSSProperties = {
  display: 'flex',
  minHeight: '100vh',
  width: '100%',
  maxWidth: 800,
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  backgroundColor: '#fff',
  padding: '120px 60px',
}

const introStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: 24,
}

const h1Style: CSSProperties = {
  maxWidth: 320,
  fontSize: 40,
  fontWeight: 600,
  lineHeight: '48px',
  letterSpacing: '-2.4px',
  color: '#000',
}

const pStyle: CSSProperties = {
  maxWidth: 440,
  fontSize: 18,
  lineHeight: '32px',
  color: '#666',
}

export default async function Home() {
  return (
    <div style={pageStyle}>
      <main style={mainStyle}>
        <div style={introStyle}>
          <h1 style={h1Style}>react-i18next + Waku RSC Demo</h1>
          <LanguageSwitcher />
          <ServerDemo />
          <ClientDemo />
          <CommonDemo />
          <p style={pStyle}>
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

export async function getConfig() {
  return {
    render: 'dynamic',
  } as const
}
