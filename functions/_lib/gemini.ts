import type { Env } from './env';

// Minimal Gemini REST client for Cloudflare Workers (no Node APIs needed).
// Docs: https://ai.google.dev/api/generate-content

const DEFAULT_MODEL = 'gemini-3.6-flash';

type Part = { text: string } | { fileData: { mimeType: string; fileUri: string } };

export interface GenerateOptions {
  text?: string;          // a plain-text prompt
  parts?: Part[];         // or explicit parts (e.g. a file + a prompt)
  schema?: unknown;       // JSON response schema; when set the reply is JSON
  googleSearch?: boolean; // ground the answer with Google Search
}

export interface GenerateResult {
  text: string;
  sources: string[]; // web pages cited by Google Search grounding
}

export class GeminiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function apiBase(env: Env) {
  return (env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com').replace(/\/$/, '');
}

function requireKey(env: Env) {
  if (!env.GEMINI_API_KEY) throw Object.assign(new Error('GEMINI_API_KEY is not set'), { publicMessage: 'The AI service is not configured yet.' });
  return env.GEMINI_API_KEY;
}

export async function generate(env: Env, opts: GenerateOptions): Promise<GenerateResult> {
  const key = requireKey(env);
  const model = env.GEMINI_MODEL || DEFAULT_MODEL;
  const parts: Part[] = opts.parts || [{ text: opts.text || '' }];

  const body: Record<string, unknown> = { contents: [{ role: 'user', parts }] };
  if (opts.schema) body.generationConfig = { responseMimeType: 'application/json', responseSchema: opts.schema };
  if (opts.googleSearch) body.tools = [{ googleSearch: {} }];

  const res = await fetch(`${apiBase(env)}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new GeminiError(res.status, data?.error?.message || `Gemini request failed (${res.status})`);

  const candidate = data?.candidates?.[0];
  const text = (candidate?.content?.parts || [])
    .filter((p: any) => typeof p.text === 'string' && !p.thought)
    .map((p: any) => p.text)
    .join('')
    .trim();
  if (!text) throw new GeminiError(502, `Gemini returned no text (finishReason: ${candidate?.finishReason || 'unknown'})`);

  const sources: string[] = (candidate?.groundingMetadata?.groundingChunks || [])
    .map((c: any) => c?.web?.uri)
    .filter(Boolean);

  return { text, sources };
}

// Parses a JSON reply, tolerating a ```json fence around it.
export function parseJsonReply<T = any>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  return JSON.parse(cleaned) as T;
}

// Uploads a file (PDF or image) to the Gemini Files API so it can be referenced
// in a prompt. Sending raw bytes avoids base64-encoding large files inside the Worker.
export async function uploadFile(env: Env, bytes: ArrayBuffer, mimeType: string, displayName: string) {
  const key = requireKey(env);
  const base = apiBase(env);

  const start = await fetch(`${base}/upload/v1beta/files`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': key,
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': String(bytes.byteLength),
      'X-Goog-Upload-Header-Content-Type': mimeType,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: displayName.slice(0, 100) } }),
  });
  const uploadUrl = start.headers.get('x-goog-upload-url');
  if (!start.ok || !uploadUrl) throw new GeminiError(start.status || 502, 'Could not start file upload to Gemini');

  const done = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
      'Content-Length': String(bytes.byteLength),
    },
    body: bytes,
  });
  const info: any = await done.json().catch(() => ({}));
  let file = info?.file;
  if (!done.ok || !file?.uri) throw new GeminiError(done.status || 502, info?.error?.message || 'Gemini file upload failed');

  // Large PDFs can take a moment to process before they can be used.
  for (let i = 0; i < 15 && file.state === 'PROCESSING'; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const poll = await fetch(`${base}/v1beta/${file.name}`, { headers: { 'x-goog-api-key': key } });
    if (poll.ok) file = await poll.json();
  }
  if (file.state === 'FAILED') throw new GeminiError(422, 'Gemini could not read this file');
  if (file.state === 'PROCESSING') throw new GeminiError(504, 'Gemini is still processing this file');

  return { uri: file.uri as string, name: file.name as string, mimeType: (file.mimeType as string) || mimeType };
}

export async function deleteFile(env: Env, name: string) {
  try {
    await fetch(`${apiBase(env)}/v1beta/${name}`, { method: 'DELETE', headers: { 'x-goog-api-key': env.GEMINI_API_KEY } });
  } catch {
    // Files expire on their own after 48 hours, so a failed delete is harmless.
  }
}

// ---------------------------------------------------------------------------
// Shared response schemas
// ---------------------------------------------------------------------------
export const topicListSchema = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      subject_name: { type: 'STRING' },
      title: { type: 'STRING' },
      description: { type: 'STRING' },
    },
    required: ['subject_name', 'title', 'description'],
  },
};
