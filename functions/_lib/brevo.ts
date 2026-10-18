import type { Env } from './env';

// Sends one transactional email through Brevo's API.
// Docs: https://developers.brevo.com/reference/sendtransacemail

export function emailConfigured(env: Env): boolean {
  return !!(env.BREVO_API_KEY && env.EMAIL_FROM);
}

export async function sendBrevoEmail(
  env: Env,
  msg: { toEmail: string; toName?: string; subject: string; html: string; text: string; tags?: string[] }
): Promise<{ ok: true; messageId?: string } | { ok: false; error: string }> {
  if (!emailConfigured(env)) return { ok: false, error: 'Email is not configured (BREVO_API_KEY / EMAIL_FROM).' };
  const base = (env.BREVO_API_BASE || 'https://api.brevo.com').replace(/\/$/, '');
  const res = await fetch(`${base}/v3/smtp/email`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY!, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME || 'uJuzi' },
      to: [{ email: msg.toEmail, ...(msg.toName ? { name: msg.toName } : {}) }],
      subject: msg.subject,
      htmlContent: msg.html,
      textContent: msg.text,
      tags: msg.tags,
    }),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data?.message || `Brevo error ${res.status}` };
  return { ok: true, messageId: data?.messageId };
}
