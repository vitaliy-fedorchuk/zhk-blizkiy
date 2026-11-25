import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  // відносні шляхи — збірку можна викласти в будь-яку папку хостингу
  base: './',
  server: { host: true, port: 5173 },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        policy: resolve(import.meta.dirname, 'politika-obrabotki-personalnyh-dannyh/index.html'),
      },
    },
  },
});
