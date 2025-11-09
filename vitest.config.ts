import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Define projects - Vitest will treat each app as a separate project
    projects: [
      'apps/app-a',
      'apps/app-b'
      // Note: app-c is intentionally excluded as it has no tests
    ],
    
    // Global coverage configuration (relaxed thresholds for PoC)
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'html'],
      reportsDirectory: './coverage',
      include: [
        'apps/app-a/src/**/*.ts',
        'apps/app-b/src/**/*.ts'
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        'apps/app-c/**'
      ],
      thresholds: {
        global: {
          branches: 0,
            functions: 0,
            lines: 0,
            statements: 0
        }
      }
    }
  }
});