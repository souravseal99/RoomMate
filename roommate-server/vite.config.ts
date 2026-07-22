/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      '@common': path.resolve(__dirname, './src/common'),
      '@types': path.resolve(__dirname, './src/common/types'),
      '@generated': path.resolve(__dirname, './generated'),
      '@config': path.resolve(__dirname, './src/config'),
      '@test': path.resolve(__dirname, './test')
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'generated'],
    setupFiles: ['./src/test-setup.ts'],
  },
});
