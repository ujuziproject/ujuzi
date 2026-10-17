import { json, readJson, errorResponse, supabaseConfig, type Env, type Data } from '../_lib/env';
import { generate, parseJsonReply, uploadFile, deleteFile, topicListSchema } from '../_lib/gemini';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];

// Breaks a student's curriculum (pasted text, or a file they uploaded to Supabase Storage)
// into a list of topics.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env, data, waitUntil }) => {
  const body = await readJson<{ text?: string; fileUrl?: string; fileMimeType?: string }>(request);
  if (!body) return json({ error: 'Invalid request.' }, 400);
  const { text, fileUrl, fileMimeType } = body;

  const prompt = `Here is a student's curriculum/syllabus. Break it down into a structured list of subjects and topics. For each topic, provide: subject_name, title, and a one-sentence description. Return this as JSON in the format: [{"subject_name": "...", "title": "...", "description": "..."}, ...]`;

  try {
    if (fileUrl && fileMimeType) {
      // Only fetch signed URLs for files in THIS student's folder of the curricula bucket,
      // so this route can't be used to fetch arbitrary web addresses.
      const { url } = supabaseConfig(env);
      const allowedPrefix = `${url}/storage/v1/object/sign/curricula/${data.userId}/`;
      if (typeof fileUrl !== 'string' || !fileUrl.startsWith(allowedPrefix)) {
        return json({ error: 'Invalid file link. Please upload the file again.' }, 400);
      }
      if (!ALLOWED_TYPES.includes(fileMimeType)) {
        return json({ error: 'Please upload a PDF or an image (PNG, JPG, WEBP).' }, 400);
      }

      const fileRes = await fetch(fileUrl);
      if (!fileRes.ok) return json({ error: 'Could not read the uploaded file. Please upload it again.' }, 400);
      const bytes = await fileRes.arrayBuffer();
      if (bytes.byteLength > MAX_FILE_BYTES) return json({ error: 'File is too large. Please upload a file under 20MB.' }, 413);

      const file = await uploadFile(env, bytes, fileMimeType, `curriculum-${data.userId}`);
      try {
        const reply = await generate(env, {
          parts: [{ fileData: { mimeType: file.mimeType, fileUri: file.uri } }, { text: prompt }],
          schema: topicListSchema,
        });
        return json({ result: parseJsonReply(reply.text) });
      } finally {
        waitUntil(deleteFile(env, file.name));
      }
    }

    if (typeof text !== 'string' || !text.trim() || text.length > 200_000) {
      return json({ error: 'Please paste your curriculum text or upload a file.' }, 400);
    }
    const reply = await generate(env, { text: `Here is the curriculum text: ${text}\n\n${prompt}`, schema: topicListSchema });
    return json({ result: parseJsonReply(reply.text) });
  } catch (err) {
    return errorResponse(err, 'Failed to extract topics. Please try again.');
  }
};
