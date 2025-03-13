import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,  // Enables global test functions (e.g., describe, it)
    environment: 'jsdom',  // Suitable for testing frontend code
    include: ['test/unit/**/*.test.{js,ts}'], // Updated to use the new unit test folder
    coverage: {
      provider: 'v8',  // Use 'v8' for built-in coverage support
      reporter: ['text', 'lcov'],  // Generate text output and lcov reports
    },
  },
});