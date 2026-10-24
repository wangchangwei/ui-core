import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { watch: { ignored: ['**/artifacts/**', '**/playwright-report/**', '**/test-results/**'] } },
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'], include: ['src/**/*.test.{ts,tsx}', 'tooling/**/*.test.{js,ts}'], restoreMocks: true },
});
