import { supabaseConfig, type Env } from './env';

// Per-hour limits on AI calls.
export const USER_CALLS_PER_HOUR = 300;     // one full semester upload is ~100 calls
export const PUBLIC_CALLS_PER_IP_HOUR = 5;  // "Try it" preview, per visitor
export const PUBLIC_CALLS_TOTAL_HOUR = 300; // "Try it" preview, all visitors combined (caps the Gemini bill)

// Checks a Supabase access token and returns the user's id, or null if it is invalid/expired.
export async function getUserId(env: Env, accessToken: string): Promise<string | null> {
  const { url, anonKey } = supabaseConfig(env);
  if (!url || !anonKey) throw Object.assign(new Error('SUPABASE_URL / SUPABASE_ANON_KEY not set'), { publicMessage: 'The server is not configured yet.' });
  const res = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const user: any = await res.json().catch(() => null);
  return user?.id || null;
}

// Counts one AI call for the logged-in student this hour and returns the running total.
// Uses the bump_ai_usage() database function (see supabase/migrations). Returns null if
// the function isn't installed yet or the database can't be reached — the request is
// then allowed rather than blocking students.
export async function bumpUserUsage(env: Env, accessToken: string): Promise<number | null> {
  const { url, anonKey } = supabaseConfig(env);
  try {
    const res = await fetch(`${url}/rest/v1/rpc/bump_ai_usage`, {
      method: 'POST',
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!res.ok) {
      console.warn('bump_ai_usage unavailable', res.status);
      return null;
    }
    return Number(await res.json());
  } catch (e) {
    console.warn('bump_ai_usage failed', e);
    return null;
  }
}

// Fallback limiter used when the database function isn't installed.
// It only counts within one Cloudflare instance, so it is a soft limit.
const memoryCounts = new Map<string, { windowStart: number; calls: number }>();
function bumpMemory(key: string): number {
  const now = Date.now();
  const windowStart = now - (now % 3600_000);
  const entry = memoryCounts.get(key);
  if (!entry || entry.windowStart !== windowStart) {
    memoryCounts.set(key, { windowStart, calls: 1 });
    return 1;
  }
  entry.calls += 1;
  return entry.calls;
}

// Counts one "Try it" call for this visitor's IP and for everyone combined.
export async function bumpPublicUsage(env: Env, ip: string): Promise<{ ipCalls: number; totalCalls: number }> {
  const { url, anonKey } = supabaseConfig(env);
  if (url && anonKey) {
    try {
      const res = await fetch(`${url}/rest/v1/rpc/bump_public_usage`, {
        method: 'POST',
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_ip: ip }),
      });
      if (res.ok) {
        const r: any = await res.json();
        return { ipCalls: Number(r.ip_calls), totalCalls: Number(r.total_calls) };
      }
      console.warn('bump_public_usage unavailable', res.status);
    } catch (e) {
      console.warn('bump_public_usage failed', e);
    }
  }
  return { ipCalls: bumpMemory(`ip:${ip}`), totalCalls: bumpMemory('total') };
}
