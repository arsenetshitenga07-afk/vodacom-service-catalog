import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import pkg from './package.json' with { type: 'json' };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Backend NestJS (endpoints.json → baseUrl http://localhost:3000/api).
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      // Pré-compile les pages dès le démarrage : le premier affichage est plus rapide.
      warmup: {
        clientFiles: ['./src/main.jsx', './src/App.jsx', './src/pages/*.jsx'],
      },
      // Les appels /api sont relayés vers le backend : pas de problème de CORS en développement.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            query: ['@tanstack/react-query'],
            i18n: ['i18next', 'react-i18next'],
          },
        },
      },
    },
  };
});
