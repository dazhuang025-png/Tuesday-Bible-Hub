import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Fix: Cast process to any to avoid TS error "Property 'cwd' does not exist on type 'Process'"
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Vital: Explicitly map Vercel environment variables to process.env
      // This allows 'process.env.API_KEY' to work in the browser code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
      'process.env.APP_PASSWORD': JSON.stringify(env.APP_PASSWORD),
    },
  };
});