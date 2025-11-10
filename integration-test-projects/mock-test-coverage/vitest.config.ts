import { defineConfig } from 'vitest/config'

export default defineConfig(function(){
  return {
    test: {
      coverage: {
        enabled: true,
        reporter: ['lcov']
      }
    }
  }
})