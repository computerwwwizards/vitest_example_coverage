import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Define projects - Vitest will treat each app as a separate project
    projects: [
      'apps/app-a',
      'apps/app-b'
      // Note: app-c is intentionally excluded as it has no tests
    ],
    
    // Global coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'html'],
      reportsDirectory: './coverage',
      // Include all TypeScript files from tested apps
      include: [
        'apps/app-a/src/**/*.ts',
        'apps/app-b/src/**/*.ts'
      ],
      // Exclude test files and app-c
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/node_modules/**',
        'apps/app-c/**'
      ],
      // Enable coverage thresholds
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
});