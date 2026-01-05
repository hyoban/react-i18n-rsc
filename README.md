# Setting Up react-i18next for React Server Components

This tutorial walks you through setting up [react-i18next](https://react.i18next.com/) for React Server Components (RSC), providing a unified API for both Server and Client Components.

## Key Features

- Unified `useTranslation` API for Server and Client Components
- Server-side resource loading with no flash of untranslated content
- Uses `package.json` imports with `react-server` condition for environment detection

## How It Works

1. **Server-side loading**: Layout fetches locale and translation resources on the server
2. **Resource passing**: Resources are passed to the client via `I18nProvider`
3. **Conditional exports**: `#i18n/useTranslation` automatically selects the correct implementation based on environment
4. **Synchronous initialization**: Client uses pre-loaded resources for synchronous init, avoiding flicker

## Step 1: Create Directory Structure

```
src/
├── i18n/
│   ├── settings.ts              # Configuration
│   ├── server.ts                # Server-side utilities
│   ├── client.ts                # Client-side utilities
│   ├── I18nProvider.tsx         # Client Provider
│   ├── useTranslation.server.ts # Server Component implementation
│   ├── useTranslation.client.ts # Client Component implementation
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
    // If fallbackLng is set, it will always be loaded alongside the current language.
    // Set to false if all translations are complete to avoid loading extra resources.
    // https://github.com/i18next/i18next/discussions/2035
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespaces,
  } satisfies InitOptions
}
```

## Step 3: Create Server-Side Utilities

Create `src/i18n/server.ts`:

```ts
import type { i18n, Resource, ResourceLanguage } from 'i18next'
import { createInstance } from 'i18next'
import { cache } from 'react'
import { initReactI18next } from 'react-i18next/initReactI18next'

import type { Locale, Namespace } from './settings'
import { defaultNS, fallbackLng, getInitOptions, namespaces } from './settings'

interface LocaleCache {
  locale?: Locale
}

const getLocaleCache = cache((): LocaleCache => ({}))

export function setRequestLocale(locale: Locale): void {
  getLocaleCache().locale = locale
}

export function getRequestLocale(): Locale {
  return getLocaleCache().locale ?? fallbackLng
}

// Implement locale retrieval based on your framework
export async function getLocaleFromCookies(): Promise<Locale> {
  // Get locale from cookies or other sources
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

export const getI18nConfig = cache(async (lng: Locale, ns: Namespace | Namespace[] = defaultNS) => {
  const i18nInstance = await getI18nextInstance(lng)
  return {
    i18n: i18nInstance,
    t: i18nInstance.getFixedT(lng, Array.isArray(ns) ? ns[0] : ns),
    lng,
    ns,
  }
})
```

Key points:
- Uses React's `cache()` for request-scoped memoization
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

  // When resources are provided, i18next skips async loading and initializes synchronously
  // https://github.com/i18next/i18next/blob/5f44eb70189ff7b1a7ff289bd4b642bdc170c152/src/i18next.js#L225-L229
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

Key points:
- When `resources` is provided, i18next's `init()` runs synchronously (no `await` needed)
- `partialBundledLanguages: true` tells i18next that only some languages are bundled, allowing the backend to load others on demand
- Custom backend handles on-demand loading of additional namespaces or languages

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

let cachedI18nInstance: i18n | null = null

export function I18nProvider({
  children,
  locale,
  resources,
}: I18nProviderProps) {
  if (!cachedI18nInstance || cachedI18nInstance.language !== locale) {
    cachedI18nInstance = createClientI18nInstanceSync(locale, resources)
  }

  return <I18nextProvider i18n={cachedI18nInstance}>{children}</I18nextProvider>
}
```

## Step 6: Create useTranslation Implementations

**Server implementation** `src/i18n/useTranslation.server.ts`:

```ts
import { use } from 'react'

import { getI18nConfig, getRequestLocale } from './server'
import type { Namespace } from './settings'
import { defaultNS } from './settings'

export function useTranslation(ns: Namespace | Namespace[] = defaultNS) {
  const lng = getRequestLocale()
  const config = use(getI18nConfig(lng, ns))

  return {
    t: config.t,
    i18n: config.i18n,
  }
}
```

**Client implementation** `src/i18n/useTranslation.client.ts`:

```ts
'use client'

import { useTranslation as useTranslationOriginal } from 'react-i18next'

import type { Namespace } from './settings'

export function useTranslation(ns?: Namespace | Namespace[]) {
  return useTranslationOriginal(ns)
}
```

## Step 7: Configure Conditional Exports

Add the `imports` field to `package.json`:

```json
{
  "imports": {
    "#i18n/useTranslation": {
      "react-server": "./src/i18n/useTranslation.server.ts",
      "default": "./src/i18n/useTranslation.client.ts"
    },
    "#i18n/settings": "./src/i18n/settings.ts",
    "#i18n/server": "./src/i18n/server.ts"
  }
}
```

This is the core mechanism:
- `react-server` condition applies in Server Component environments
- `default` condition applies in Client Component environments
- The same `#i18n/useTranslation` import automatically selects the correct implementation

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
import { useTranslation } from '#i18n/useTranslation'

export function ServerDemo() {
  const { t } = useTranslation()

  return (
    <div>
      <h3>{t('Server Component')}</h3>
      <p>{t('Welcome to React')}</p>
    </div>
  )
}
```

**Client Component**:

```tsx
'use client'

import { useTranslation } from '#i18n/useTranslation'

export function ClientDemo() {
  const { t } = useTranslation()

  return (
    <div>
      <h3>{t('Client Component')}</h3>
      <p>{t('Welcome to React')}</p>
    </div>
  )
}
```

Note: Both components use the exact same API!

## Acknowledgments

This architecture is heavily inspired by [next-intl](https://github.com/amannn/next-intl), particularly:

- Using `react-server` conditional exports to distinguish Server/Client Components
- Server-side resource loading to avoid client-side flash
- Request-scoped caching with React's `cache()` function

## License

MIT
