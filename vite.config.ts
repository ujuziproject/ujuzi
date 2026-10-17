import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Public Supabase project settings. The anon key is designed to be public (it ships
// inside the browser app); data is protected by Row Level Security, not by hiding it.
// Environment variables SUPABASE_URL / SUPABASE_ANON_KEY override these if set.
// NEVER put the Gemini key or the Supabase service_role key in code.
const DEFAULT_SUPABASE_URL = 'https://vfvugkpzxpxxffgbxndj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdnVna3B6eHB4eGZmZ2J4bmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTk0NTAsImV4cCI6MjEwMTY3NTQ1MH0.NNlhWPqUBtEmHP344ZzW-KEU6gdKWVLghFO52d-0TVo';

// Use an env value only if it looks right; otherwise fall back to the built-in default.
function pick(value: string | undefined, fallback: string, looksValid: (v: string) => boolean) {
  const v = (value || '').trim();
  return v && looksValid(v) ? v : fallback;
}
const SUPABASE_URL = pick(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL, DEFAULT_SUPABASE_URL, v => /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(v));
const SUPABASE_ANON_KEY = pick(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_ANON_KEY, v => v.startsWith('eyJ') || v.startsWith('sb_publishable_'));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(SUPABASE_URL.replace(/\/$/, '')),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // `npm run dev` serves the front end only. To use the AI features locally,
      // run `npx wrangler pages dev dist` in another terminal; /api calls are proxied to it.
      proxy: { '/api': 'http://127.0.0.1:8788' },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
