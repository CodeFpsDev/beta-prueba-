import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      {
        name: 'github-pages-dev-transform',
        transformIndexHtml(html, ctx) {
          if (ctx.server) {
            return html
              .replace(
                /<script[^>]*src=["']\.\/assets\/index\.js["'][^>]*><\/script>/gi,
                '<script type="module" src="/src/main.tsx"></script>'
              )
              .replace(
                /<link[^>]*href=["']\.\/assets\/index\.css["'][^>]*>/gi,
                ''
              );
          }
          return html;
        },
      },
      react(),
      tailwindcss(),
    ],
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
