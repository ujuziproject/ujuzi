import { supabase } from './supabase';

// Same as fetch(), but attaches the logged-in student's Supabase access token
// so the server can check who is calling. Use this for every /api/* call
// except /api/public/*.
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
