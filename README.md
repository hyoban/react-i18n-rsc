# Setting Up react-i18next for React Server Components

This tutorial walks you through setting up [react-i18next](https://react.i18next.com/) for React Server Components (RSC), providing a unified API for both Server and Client Components.

This architecture is heavily inspired by [next-intl](https://github.com/amannn/next-intl), particularly:

- Using `react-server` conditional exports to distinguish Server/Client Components
- Server-side resource loading to avoid client-side flash
- Request-scoped caching with React's `cache()` function

## Key Features

- Unified `useTranslation` and `useLocale` API for Server and Client Components
- Server-side resource loading with no flash of untranslated content
- Uses `package.json` imports with `react-server` condition for environment detection

## How It Works

1. **Server-side loading**: Layout fetches locale and translation resources on the server
2. **Resource passing**: Resources are passed to the client via `I18nProvider`
3. **Conditional exports**: `#i18n/hooks` automatically selects the correct implementation based on environment
4. **Synchronous initialization**: Client uses pre-loaded resources for synchronous init, avoiding flicker

## Step 1: Create Directory Structure

```
src/
├── i18n/
│   ├── settings.ts              # Configuration
│   ├── server.ts                # Server-side utilities
│   ├── client.ts                # Client-side utilities
│   ├── I18nProvider.tsx         # Client Provider
│   ├── hooks.server.ts          # Server hooks (useTranslation, useLocale)
│   ├── hooks.client.ts          # Client hooks (useTranslation, useLocale)
│   ├── resources.ts             # TypeScript resource definitions
│   └── i18next.d.ts             # Type declarations
└── locales/
    ├── en/
    │   ├── translation.json
    │   └── common.json
    └── zh/
        ├── translation.json
        └── common.json
```

## Step 2: Configure Base Settings

Create `src/i18n/settings.ts`:

```ts
import type { InitOptions } from 'i18next'

export const LOCALE_COOKIE = 'i18next'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'zh'] as const
export const namespaces = ['translation', 'common'] as const
export const defaultNS = namespaces[0]

export type Locale = (typeof languages)[number]
export type Namespace = (typeof namespaces)[number]

export function getInitOptions(lng?: Locale) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespaces,
  } satisfies InitOptions
}
```

Note: If `fallbackLng` is set, it will always be loaded alongside the current language. Set to `false` if all translations are complete to avoid loading extra resources. See [i18next discussion](https://github.com/i18next/i18next/discussions/2035) for details.

## Step 3: Create Server-Side Utilities

Create `src/i18n/server.ts`:

```ts
import type { Resource, ResourceLanguage } from 'i18next'
import { createInstance } from 'i18next'
import { cache } from 'react'
import { initReactI18next } from 'react-i18next/initReactI18next'

import { serverOnlyContext } from './server-only-context'
import type { Locale, Namespace } from './settings'
import { defaultNS, fallbackLng, getInitOptions, namespaces } from './settings'

export const [getRequestLocale, setRequestLocale] = serverOnlyContext<Locale>(fallbackLng)

export async function getLocaleFromCookies(): Promise<Locale> {
  // Implement locale retrieval based on your framework
  return fallbackLng
}

export const getResources = cache(async (lng: Locale, ns?: Namespace[]): Promise<Resource> => {
  const messages = {} as ResourceLanguage

  await Promise.all(
    (ns ?? namespaces).map(async (ns) => {
      const module = await import(`../locales/${lng}/${ns}.json`)
      messages[ns] = module.default
    }),
  )

  return { [lng]: messages }
})

const getI18nextInstance = cache(async (lng: Locale) => {
  const resources = await getResources(lng)
  const instance = createInstance()

  await instance
    .use(initReactI18next)
    .init({
      ...getInitOptions(lng),
      resources,
    })

  return instance
})

export const getI18nConfig = cache(async (lng: Locale, ns: Namespace = defaultNS) => {
  const i18nInstance = await getI18nextInstance(lng)
  return {
    i18n: i18nInstance,
    t: i18nInstance.getFixedT(lng, ns),
    lng,
    ns,
  }
})
```

Key points:
- `serverOnlyContext` creates request-scoped state using React's `cache()`
- `setRequestLocale` and `getRequestLocale` share locale within request lifecycle

## Step 4: Create Client-Side Utilities

Create `src/i18n/client.ts`:

```ts
import type { i18n, Resource } from 'i18next'
import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next/initReactI18next'

import type { Locale } from './settings'
import { getInitOptions } from './settings'

function getBackend() {
  return {
    type: 'backend' as const,
    init() {},
    read(language: string, namespace: string, callback: (err: unknown, data?: unknown) => void) {
      import(`../locales/${language}/${namespace}.json`)
        .then(data => callback(null, data.default ?? data))
        .catch(callback)
    },
  }
}

export function createClientI18nInstanceSync(
  lng: Locale,
  resources: Resource,
): i18n {
  const instance = createInstance()

  instance
    .use(initReactI18next)
    .use(getBackend())
    .init({
      ...getInitOptions(lng),
      resources,
      partialBundledLanguages: true,
    })

  return instance
}
```

When `resources` is provided, [i18next skips async loading](https://github.com/i18next/i18next/blob/5f44eb70189ff7b1a7ff289bd4b642bdc170c152/src/i18next.js#L225-L229) and `init()` runs synchronously (no `await` needed). Setting `partialBundledLanguages: true` tells i18next that only some languages are bundled, allowing the custom backend to load others on demand.

## Step 5: Create I18nProvider

Create `src/i18n/I18nProvider.tsx`:

```tsx
'use client'

import type { i18n, Resource } from 'i18next'
import type { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'

import { createClientI18nInstanceSync } from './client'
import type { Locale } from './settings'

interface I18nProviderProps {
  children: ReactNode
  locale: Locale
  resources: Resource
}

export function I18nProvider({
  children,
  locale,
  resources,
}: I18nProviderProps) {
  const i18n = createClientI18nInstanceSync(locale, resources)
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
```

## Step 6: Create Hooks Implementations

**Server implementation** `src/i18n/hooks.server.ts`:

```ts
import { use } from 'react'

import { getI18nConfig, getRequestLocale } from './server'
import type { Locale, Namespace } from './settings'
import { defaultNS } from './settings'

export function useTranslation(ns: Namespace = defaultNS) {
  const lng = getRequestLocale()
  const config = use(getI18nConfig(lng, ns))

  return {
    t: config.t,
    i18n: config.i18n,
  }
}

export function useLocale(): Locale {
  return getRequestLocale()
}
```

**Client implementation** `src/i18n/hooks.client.ts`:

```ts
'use client'

import { useTranslation as useTranslationOriginal } from 'react-i18next'

import type { Locale, Namespace } from './settings'

export function useTranslation(ns?: Namespace) {
  return useTranslationOriginal(ns)
}

export function useLocale(): Locale {
  const { i18n } = useTranslationOriginal()
  return i18n.language as Locale
}
```

## Step 7: Configure Conditional Exports

Add the `imports` field to `package.json`:

```json
{
  "imports": {
    "#i18n/hooks": {
      "react-server": "./src/i18n/hooks.server.ts",
      "default": "./src/i18n/hooks.client.ts"
    },
    "#i18n/settings": "./src/i18n/settings.ts",
    "#i18n/server": "./src/i18n/server.ts"
  }
}
```

This is the core mechanism:
- `react-server` condition applies in Server Component environments
- `default` condition applies in Client Component environments
- The same `#i18n/hooks` import automatically selects the correct implementation

## Step 8: Use in Layout

```tsx
import type { ReactNode } from 'react'

import { getLocaleFromCookies, getResources, setRequestLocale } from '#i18n/server'
import { I18nProvider } from '../i18n/I18nProvider'

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const locale = await getLocaleFromCookies()
  setRequestLocale(locale)

  const resources = await getResources(locale)

  return (
    <I18nProvider locale={locale} resources={resources}>
      {children}
    </I18nProvider>
  )
}
```

## Step 9: Use in Components

**Server Component**:

```tsx
import { useLocale, useTranslation } from '#i18n/hooks'

export function ServerDemo() {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div>
      <h3>{t('Server Component')}</h3>
      <p>{t('Welcome to React')}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
```

**Client Component**:

```tsx
'use client'

import { useLocale, useTranslation } from '#i18n/hooks'

export function ClientDemo() {
  const { t } = useTranslation()
  const locale = useLocale()

  return (
    <div>
      <h3>{t('Client Component')}</h3>
      <p>{t('Welcome to React')}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
```

Note: Both components use the exact same API!

## License

MIT
