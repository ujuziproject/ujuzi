import { json, readJson, errorResponse, type Env, type Data } from '../_lib/env';
import { generate, parseJsonReply } from '../_lib/gemini';

// Builds a short diagnostic quiz (1–2 questions per topic) used to decide how deep
// each topic's study materials should go.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env }) => {
  const body = await readJson<{ topics?: { id?: string; title?: string; description?: string }[] }>(request);
  const topics = body?.topics;
  if (!Array.isArray(topics) || topics.length === 0 || topics.length > 40) {
    return json({ error: 'Send between 1 and 40 topics.' }, 400);
  }

  // Include each topic's id so the model can echo it back in topic_id.
  const prompt = `Generate a quick diagnostic quiz covering these topics:\n` +
    topics.map(t => `- [id: ${t.id}] ${t.title}: ${t.description}`).join('\n') +
    `\n\nCreate exactly 1 or 2 multiple-choice questions for EACH topic. Return an array of objects, where each object has { topic_id, question_text, options (array of 4 strings), correct_answer }. The topic_id must match the id provided.`;

  try {
    const reply = await generate(env, {
      text: prompt,
      schema: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            topic_id: { type: 'STRING' },
            question_text: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            correct_answer: { type: 'STRING' },
          },
          required: ['topic_id', 'question_text', 'options', 'correct_answer'],
        },
      },
    });
    return json({ result: parseJsonReply(reply.text) });
  } catch (err) {
    return errorResponse(err, 'Failed to build the diagnostic quiz. Please try again.');
  }
};
