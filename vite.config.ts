import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Converts local file URLs to paths without a dependency on @types/node.
const pathFromUrl = (relative:string) => decodeURIComponent(new URL(relative,import.meta.url).pathname).replace(/^\\/([A-Za-z]:)/,'$1');

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: pathFromUrl('./index.html'),
        temporal: pathFromUrl('./temporal-embed.html'),
      },
    },
  },
});
