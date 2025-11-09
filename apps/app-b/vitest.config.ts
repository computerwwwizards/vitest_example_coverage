import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    name: 'app-b',
    // Test file patterns
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    
    // Environment configuration
    environment: 'node',
    
    // Project-specific test configuration
    globals: true,
    
    // TypeScript configuration
    typecheck: {
      enabled: true
    }
  }
});