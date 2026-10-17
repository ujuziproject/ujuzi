import { json, type Env, type Data } from '../_lib/env';
import { getUserId, bumpUserUsage, USER_CALLS_PER_HOUR } from '../_lib/auth';

// Runs before every /api/* function.
// Everything except /api/public/* requires a logged-in student, and each student
// gets USER_CALLS_PER_HOUR AI calls per hour.
const requireStudent: PagesFunction<Env, string, Data> = async (context) => {
  const path = new URL(context.request.url).pathname;
  if (path.startsWith('/api/public/')) return context.next();

  const header = context.request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return json({ error: 'Please log in again.' }, 401);

  let userId: string | null;
  try {
    userId = await getUserId(context.env, token);
  } catch (e: any) {
    console.error(e?.message);
    return json({ error: e?.publicMessage || 'Could not check your login. Please try again.' }, 500);
  }
  if (!userId) return json({ error: 'Your session has expired. Please log in again.' }, 401);

  const calls = await bumpUserUsage(context.env, token);
  if (calls !== null && calls > USER_CALLS_PER_HOUR) {
    return json({ error: "You've hit the hourly limit for AI generation. Please try again in a little while." }, 429, { 'Retry-After': '3600' });
  }

  context.data.userId = userId;
  context.data.accessToken = token;
  return context.next();
};

export const onRequest = [requireStudent];
