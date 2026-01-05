import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  pnpm: false,
  ignores: ['src/pages.gen.ts'],
})
