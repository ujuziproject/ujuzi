// uJuzi email templates. Plain table layout with inline styles so they render in
// Gmail, Outlook and phone mail apps. Every value from the student is escaped.

export interface RenderedEmail { subject: string; html: string; text: string }

const esc = (v: unknown) =>
  String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function layout(opts: { preheader: string; heading: string; bodyHtml: string; ctaLabel: string; ctaUrl: string; appUrl: string }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(opts.heading)}</title></head>
<body style="margin:0;padding:0;background:#F4F3FB;font-family:'DM Sans',Arial,Helvetica,sans-serif;color:#110B29;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F3FB;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
    <tr><td style="padding:8px 4px 16px;font-size:22px;font-weight:800;color:#110B29;">uJuzi</td></tr>
    <tr><td style="background:#ffffff;border-radius:20px;padding:32px 28px;border:1px solid #ECEAF7;">
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#110B29;">${esc(opts.heading)}</h1>
      ${opts.bodyHtml}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 6px;"><tr><td style="border-radius:999px;background:#6C5CE7;">
        <a href="${esc(opts.ctaUrl)}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:999px;">${esc(opts.ctaLabel)}</a>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:18px 6px;font-size:12px;line-height:1.6;color:#6B6880;">
      You're getting this because you have a uJuzi account. Questions? Just reply to this email.<br>
      <a href="${esc(opts.appUrl)}/privacy" style="color:#6B6880;">Privacy Policy</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const p = (html: string) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3C3852;">${html}</p>`;

export type TemplateName = 'welcome' | 'study_pack_ready';

export function renderEmail(name: TemplateName, ctx: { firstName: string; appUrl: string; data: Record<string, unknown> }): RenderedEmail {
  const hi = ctx.firstName ? `Hi ${esc(ctx.firstName)},` : 'Hi there,';
  const hiText = ctx.firstName ? `Hi ${ctx.firstName},` : 'Hi there,';

  if (name === 'welcome') {
    const track = String(ctx.data.track || '');
    const next =
      track === 'university' ? 'Add your first course outline' :
      track === 'independent' ? 'Add the syllabus for your goal' :
      'Add your first subject syllabus';
    return {
      subject: 'Welcome to uJuzi 🎉 Your study plan starts here',
      html: layout({
        preheader: 'Turn your syllabus into notes, flashcards and quizzes in minutes.',
        heading: 'Welcome to uJuzi!',
        bodyHtml:
          p(hi) +
          p('Your account is ready. uJuzi turns your <strong>real syllabus</strong> into lecture notes, flashcards and quizzes, then plans what to study each day.') +
          p(`<strong>Your next step:</strong> ${esc(next)}. It takes about two minutes.`) +
          p('Tip: short daily sessions beat last-minute cramming. Even 20 minutes a day keeps your streak alive.'),
        ctaLabel: 'Open uJuzi',
        ctaUrl: ctx.appUrl,
        appUrl: ctx.appUrl,
      }),
      text: `${hiText}\n\nWelcome to uJuzi! Your account is ready. uJuzi turns your real syllabus into lecture notes, flashcards and quizzes, then plans what to study each day.\n\nYour next step: ${next}. It takes about two minutes.\n\nOpen uJuzi: ${ctx.appUrl}`,
    };
  }

  // study_pack_ready
  const course = String(ctx.data.courseTitle || 'your course').slice(0, 120);
  const topics = Number(ctx.data.topicCount || 0);
  const topicText = topics === 1 ? '1 topic' : `${topics} topics`;
  return {
    subject: `Your study pack for ${course} is ready 📚`,
    html: layout({
      preheader: `${topicText} with notes, flashcards and quizzes.`,
      heading: 'Your study pack is ready',
      bodyHtml:
        p(hi) +
        p(`We've finished building <strong>${esc(course)}</strong>: ${esc(topicText)}, each with lecture notes, flashcards and a quiz.`) +
        p('Your Planner has been updated with what to study first. Start with a quick flashcard round today — testing yourself is the fastest way to remember.'),
      ctaLabel: 'Start studying',
      ctaUrl: ctx.appUrl,
      appUrl: ctx.appUrl,
    }),
    text: `${hiText}\n\nWe've finished building ${course}: ${topicText}, each with lecture notes, flashcards and a quiz. Your Planner has been updated with what to study first.\n\nStart studying: ${ctx.appUrl}`,
  };
}
