import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  // Build-time flags from rspack DefinePlugin. Tests always run as the OSS edition.
  define: {
    __IS_PRIVATE__: 'false',
    __AUTHORING__: 'false',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/test/**/*.(spec|test).ts?(x)', '**/test/**/*.(spec|test).js?(x)'],
    exclude: ['node_modules/', 'dist/', 'src/engine/', 'e2e/'],
    coverage: {
      provider: 'v8',
      exclude: ['node_modules/', 'dist/', 'src/engine/', 'src/engine/ootk/'],
      reportsDirectory: 'coverage',
    },
    setupFiles: ['./vitest.setup.ts'],
    deps: {
      inline: ['uuid', 'ootk'],
    },
  },
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src'),
      '@engine': path.resolve(__dirname, './src/engine'),
      '@private': path.resolve(__dirname, './src/private/app'),
    },
  },
});
