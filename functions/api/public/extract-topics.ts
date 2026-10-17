import { json, errorResponse, type Env, type Data } from '../../_lib/env';
import { generate, parseJsonReply, uploadFile, deleteFile, topicListSchema } from '../../_lib/gemini';
import { bumpPublicUsage, PUBLIC_CALLS_PER_IP_HOUR, PUBLIC_CALLS_TOTAL_HOUR } from '../../_lib/auth';

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 30_000;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

// "Try it" preview on the landing page — no login needed, so it is tightly limited.
// Send either JSON { text } or the raw file bytes with the file's Content-Type.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env, waitUntil }) => {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const { ipCalls, totalCalls } = await bumpPublicUsage(env, ip);
  if (ipCalls > PUBLIC_CALLS_PER_IP_HOUR) {
    return json({ error: 'Too many tries from this network. Sign up free to keep going, or try again in an hour.' }, 429, { 'Retry-After': '3600' });
  }
  if (totalCalls > PUBLIC_CALLS_TOTAL_HOUR) {
    return json({ error: 'The free preview is very busy right now. Sign up free to continue, or try again later.' }, 429, { 'Retry-After': '3600' });
  }

  const prompt = `Extract a list of topics from this curriculum document. Return an array of objects, where each object has { subject_name, title, description }. The subject_name should be a broad category, title should be the specific topic, and description should be a 1-2 sentence summary of what to study.`;
  const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();

  try {
    if (contentType === 'application/json') {
      const body: any = await request.json().catch(() => null);
      const text = body?.text;
      if (typeof text !== 'string' || !text.trim() || text.length > MAX_TEXT_CHARS) {
        return json({ error: 'Please paste between 1 and 30,000 characters of syllabus text.' }, 400);
      }
      const reply = await generate(env, { text: `Here is the curriculum text: ${text}\n\n${prompt}`, schema: topicListSchema });
      return json({ result: parseJsonReply(reply.text) });
    }

    if (!ALLOWED_TYPES.includes(contentType)) {
      return json({ error: 'Please upload a PDF or image under 10MB.' }, 400);
    }
    const declared = Number(request.headers.get('Content-Length') || '0');
    if (declared > MAX_FILE_BYTES) return json({ error: 'Please upload a PDF or image under 10MB.' }, 413);
    const bytes = await request.arrayBuffer();
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_FILE_BYTES) {
      return json({ error: 'Please upload a PDF or image under 10MB.' }, 413);
    }

    const file = await uploadFile(env, bytes, contentType, 'try-it-preview');
    try {
      const reply = await generate(env, {
        parts: [{ fileData: { mimeType: file.mimeType, fileUri: file.uri } }, { text: prompt }],
        schema: topicListSchema,
      });
      return json({ result: parseJsonReply(reply.text) });
    } finally {
      waitUntil(deleteFile(env, file.name));
    }
  } catch (err) {
    return errorResponse(err, 'Failed to extract topics. Please try again.');
  }
};
