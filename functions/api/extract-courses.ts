import { json, readJson, errorResponse, type Env, type Data } from '../_lib/env';
import { generate, parseJsonReply } from '../_lib/gemini';

// Splits one combined semester outline into separate courses, each with its topics.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env }) => {
  const body = await readJson<{ text?: string }>(request);
  const text = body?.text;
  if (typeof text !== 'string' || !text.trim() || text.length > 200_000) {
    return json({ error: 'Please provide the course outline text.' }, 400);
  }

  const prompt = `Here is a university student's combined course outline for one semester, potentially covering multiple distinct courses. Identify each distinct course, and for each one provide: course_code (if identifiable, otherwise null), course_title, and a list of topics (each with title and description).`;

  try {
    const reply = await generate(env, {
      text: `Here is the text: ${text}\n\n${prompt}`,
      schema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            course_code: { type: 'STRING' },
            course_title: { type: 'STRING' },
            topics: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: { title: { type: 'STRING' }, description: { type: 'STRING' } },
                required: ['title', 'description'],
              },
            },
          },
          required: ['course_title', 'topics'],
        },
      },
    });
    return json({ result: parseJsonReply(reply.text) });
  } catch (err) {
    return errorResponse(err, 'Failed to read the course outline. Please try again.');
  }
};
