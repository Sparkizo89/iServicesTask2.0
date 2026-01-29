import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement (comme API_KEY)
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Cette ligne est CRUCIALE : elle injecte la clé API dans le code final
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});