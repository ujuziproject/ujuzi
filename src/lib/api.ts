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

// Builds an Error from a failed /api response, using the server's message when there is one
// (e.g. "Your session has expired" or the hourly limit message).
export async function apiError(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.clone().json();
    if (data?.error) return new Error(data.detail ? `${data.error} (${data.detail})` : data.error);
  } catch {
    // not JSON
  }
  return new Error(fallback);
}
