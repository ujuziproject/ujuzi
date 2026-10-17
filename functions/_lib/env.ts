// Environment variables available to every Cloudflare Pages Function.
// Only GEMINI_API_KEY must be set in Cloudflare (Pages project → Settings →
// Variables and Secrets, as an encrypted Secret, for BOTH Production and Preview).
export interface Env {
  GEMINI_API_KEY: string;            // secret
  SUPABASE_URL?: string;             // e.g. https://xxxx.supabase.co
  SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;        // accepted as a fallback name
  VITE_SUPABASE_ANON_KEY?: string;   // accepted as a fallback name
  GEMINI_MODEL?: string;             // optional override, defaults to gemini-3.6-flash
  GEMINI_API_BASE?: string;          // optional override, only used for local testing
}

// Values the auth middleware passes on to each route.
export interface Data extends Record<string, unknown> {
  userId?: string;
  accessToken?: string;
}

export type Ctx = EventContext<Env, string, Data>;

// Public Supabase project settings. The anon key is designed to be public (it ships
// inside the browser app); data is protected by Row Level Security, not by hiding it.
// Environment variables SUPABASE_URL / SUPABASE_ANON_KEY override these if set.
// NEVER put the Gemini key or the Supabase service_role key in code.
const DEFAULT_SUPABASE_URL = 'https://vfvugkpzxpxxffgbxndj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmdnVna3B6eHB4eGZmZ2J4bmRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwOTk0NTAsImV4cCI6MjEwMTY3NTQ1MH0.NNlhWPqUBtEmHP344ZzW-KEU6gdKWVLghFO52d-0TVo';

export function supabaseConfig(env: Env) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/$/, '');
  const anonKey = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

// Reads a JSON request body, returning null if it is missing or malformed.
export async function readJson<T = any>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// Turns any thrown error into a JSON error response without leaking internals.
export function errorResponse(err: unknown, fallback: string): Response {
  const e = err as { status?: number; publicMessage?: string; message?: string };
  console.error(fallback, e?.message || err);
  if (e?.status === 429) return json({ error: 'The AI service is busy right now. Please try again in a minute.' }, 503);
  return json({ error: e?.publicMessage || fallback }, 500);
}
