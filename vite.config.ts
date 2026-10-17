import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Resolve entry points without requiring undeclared Node types.
const pathFromUrl = (relative:string) => {
  const pathname=decodeURIComponent(new URL(relative,import.meta.url).pathname);
  return pathname.startsWith('/') && pathname.charAt(2)===':' ? pathname.slice(1) : pathname;
};

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
