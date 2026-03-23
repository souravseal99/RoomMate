import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths()],


  test: {
    globals: true,
    environment: 'node',
    // Optional: specify test file patterns
    include: ['src/**/*.{test,spec}.{js,ts}'],
    // Optional: exclude patterns
    exclude: ['node_modules', 'dist', 'generated'],
    setupFiles: ['./src/test-setup.ts'],
  },

  
});
