// Turns a Supabase/Postgres error into a sentence a student can act on.
export function friendlyDbError(error: { code?: string; message?: string } | null | undefined, what = 'that'): string {
  if (!error) return '';
  if (error.code === '23505') return `You already have ${what}. Pick it from your list instead.`;
  if (error.code === '42501') return `You don't have permission to save ${what}. Try logging out and back in.`;
  return `Couldn't save ${what}. Please try again.${error.message ? ` (${error.message})` : ''}`;
}

// Supabase auth calls throw "Failed to fetch" (Chrome) / "Load failed" (Safari) / "NetworkError…" (Firefox)
// when the browser can't reach the server at all.
export function friendlyAuthError(err: any, fallback: string): string {
  const msg = String(err?.message || '');
  if (/failed to fetch|load failed|networkerror|network request failed/i.test(msg)) {
    return "We couldn't reach the uJuzi server. Check your internet connection and try again. If it keeps happening, the service may be temporarily down.";
  }
  return msg || fallback;
}
