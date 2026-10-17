import { json } from '../_lib/env';

// Any /api/* address that doesn't match a function returns a JSON 404
// (instead of falling through to the app's index.html).
export const onRequest: PagesFunction = async () => json({ error: 'Not found' }, 404);
