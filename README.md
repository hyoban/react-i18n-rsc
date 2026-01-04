# next-react-i18n

A minimal i18n solution for Next.js App Router using [react-i18next](https://react.i18next.com/), with first-class support for both Server and Client Components.

## Features

- Unified `useTranslation` API for Server and Client Components
- Two initialization modes: server-side (no flicker) or client-side (async)
- Uses `package.json` imports with `react-server` condition for environment detection
- Built on top of i18next ecosystem
- TypeScript support with type-safe translation keys

## Architecture

Inspired by [next-intl](https://github.com/amannn/next-intl)'s approach to handling Server/Client Components:

- Uses conditional exports (`react-server`) to provide different implementations
- Server Components use React's `cache()` for request-scoped memoization
- Client Components can receive pre-loaded messages from server (recommended) or load async

## Usage

### Mode A: Server-side messages (Recommended)

Messages are loaded on the server and passed to the client. No flicker.

```tsx
// layout.tsx
import { getLocaleFromCookies, getMessages } from '#i18n/server'
import { I18nProvider } from '@/i18n/I18nProvider'

export default async function RootLayout({ children }) {
  const locale = await getLocaleFromCookies()
  const messages = await getMessages(locale)

  return (
    <I18nProvider locale={locale} messages={messages}>
      {children}
    </I18nProvider>
  )
}
```

### Mode B: Client-side async loading

Messages are loaded on the client. Shows fallback while loading.

```tsx
// layout.tsx
<I18nProvider locale={locale} fallback={<Loading />}>
  {children}
</I18nProvider>
```

### Using translations

Same API for both Server and Client Components:

```tsx
import { useTranslation } from '#i18n/useTranslation'

export function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('hello')}</h1>
}
```

## File Structure

```
src/i18n/
├── settings.ts              # Configuration, types, constants (shared)
├── server.ts                # Server-only (getMessages, getTranslation, locale utils)
├── client.ts                # Client-only (i18next instance factories, backend)
├── I18nProvider.tsx         # Client provider with sync/async modes
├── useTranslation.server.ts # Server Component implementation
├── useTranslation.client.ts # Client Component implementation
├── resources.ts             # TypeScript resource definitions
└── i18next.d.ts             # Type declarations

src/locales/
├── en/
│   ├── translation.json
│   └── common.json
└── zh/
    ├── translation.json
    └── common.json
```

## Acknowledgments

This project's architecture is heavily inspired by [next-intl](https://github.com/amannn/next-intl), particularly:

- The use of `react-server` conditional exports for Server/Client Component detection
- Server-side message loading to avoid client-side flicker
- Request-scoped caching with React's `cache()` function

## License

MIT
