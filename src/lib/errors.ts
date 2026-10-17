// Turns a Supabase/Postgres error into a sentence a student can act on.
export function friendlyDbError(error: { code?: string; message?: string } | null | undefined, what = 'that'): string {
  if (!error) return '';
  if (error.code === '23505') return `You already have ${what}. Pick it from your list instead.`;
  if (error.code === '42501') return `You don't have permission to save ${what}. Try logging out and back in.`;
  return `Couldn't save ${what}. Please try again.${error.message ? ` (${error.message})` : ''}`;
}
