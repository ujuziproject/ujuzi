import { authFetch } from './api';

// Asks the server to send one of uJuzi's emails to the signed-in student.
// Fire-and-forget: a failed email never blocks or breaks the app.
export function sendAppEmail(template: 'welcome' | 'study_pack_ready', data: Record<string, unknown> = {}) {
  authFetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template, data }),
  }).catch(err => console.warn('Email request failed', err));
}
