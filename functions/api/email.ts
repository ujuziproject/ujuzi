import { json, readJson, type Env, type Data } from '../_lib/env';
import { emailConfigured, sendBrevoEmail } from '../_lib/brevo';
import { renderEmail, type TemplateName } from '../_lib/emailTemplates';

const TEMPLATES: TemplateName[] = ['welcome', 'study_pack_ready'];

// Sends one of uJuzi's fixed emails to the signed-in student (never to any other address).
// If Brevo isn't configured yet, it quietly does nothing so the app keeps working.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env, data }) => {
  const body = await readJson<{ template?: string; data?: Record<string, unknown> }>(request);
  const template = body?.template as TemplateName;
  if (!TEMPLATES.includes(template)) return json({ error: 'Unknown email template.' }, 400);
  if (!data.userEmail) return json({ error: 'Your account has no email address.' }, 400);
  if (!emailConfigured(env)) return json({ skipped: true, reason: 'Email not configured yet' });

  const firstName = (data.userName || '').trim().split(/\s+/)[0] || '';
  const appUrl = (env.APP_URL || 'https://ujuzi.pages.dev').replace(/\/$/, '');
  const email = renderEmail(template, { firstName, appUrl, data: body?.data || {} });

  const result = await sendBrevoEmail(env, {
    toEmail: data.userEmail,
    toName: data.userName || undefined,
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: [template],
  });
  if ('error' in result) {
    console.error('Brevo send failed', template, result.error);
    return json({ error: 'Email could not be sent.', detail: result.error }, 502);
  }
  return json({ sent: true });
};
