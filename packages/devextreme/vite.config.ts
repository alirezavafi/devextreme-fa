import path from 'path';
import { defineConfig } from 'vite';
import devextremeVitePlugin from './build/vite-plugin-devextreme';

// The static playground build is served from a sub-path on the demo host, so the
// base is overridable without touching the config (dev keeps serving from '/').
const base = process.env.PLAYGROUND_BASE ?? '/';

const page = (name: string): string => path.resolve(__dirname, `./playground/${name}.html`);

export default defineConfig({
  root: './playground',
  base,
  plugins: [devextremeVitePlugin()],
  esbuild: false,
  server: {
    port: 3000,
    fs: {
      allow: ['..', '.', '../..'],
    },
  },
  build: {
    outDir: path.resolve(__dirname, './artifacts/playground'),
    emptyOutDir: true,
    // The TS sources are shipped untranspiled (esbuild is off), so let Rollup
    // parse them as-is and keep the chunk budget quiet for a demo bundle.
    chunkSizeWarningLimit: 8000,
    rollupOptions: {
      input: {
        showcase: page('showcase'),
        calendar: page('calendar'),
        'date-box': page('date-box'),
        'date-range-box': page('date-range-box'),
        'data-grid': page('data-grid'),
        'pivot-grid': page('pivot-grid'),
        scheduler: page('scheduler'),
        'calendar-multi': page('calendar-multi'),
        'viz-chat-multi': page('viz-chat-multi'),
        'gantt-multi-calendar': page('gantt-multi-calendar'),
      },
    },
  },
  resolve: {
    alias: {
      'core': path.resolve(__dirname, './js/core'),
      'common': path.resolve(__dirname, './js/common'),
      'data': path.resolve(__dirname, './js/data'),
      'ui': path.resolve(__dirname, './js/ui'),
      '@js': path.resolve(__dirname, './js'),
      '@ts': path.resolve(__dirname, './js/__internal'),
      '__internal': path.resolve(__dirname, './js/__internal'),
    },
  },
});
