import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reporter: ['html'],
      reportsDirectory: '../../public/coverage/dashboard',
    },
    globals: true,
    include: ['**/*.test.ts'],
  },
})
