import { json, readJson, errorResponse, type Env, type Data } from '../_lib/env';
import { generate, parseJsonReply } from '../_lib/gemini';

interface Body {
  title?: string;
  description?: string;
  subject_name?: string;
  subject_exam_type?: string;
  generation_depth?: 'light' | 'standard' | 'deep';
  content_format_preference?: string;
  explanation_complexity_preference?: string;
}

// Generates lecture notes, flashcards and a quiz for one topic.
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env }) => {
  const body = await readJson<Body>(request);
  if (!body?.title || body.title.length > 500) return json({ error: 'Missing topic title.' }, 400);
  const { title, description, subject_name, subject_exam_type, generation_depth, content_format_preference, explanation_complexity_preference } = body;

  let styleInstruction = '';
  if (content_format_preference === 'visual') {
    styleInstruction += 'Structure lecture notes with more visual scaffolding — use described diagrams, labeled step-by-step breakdowns, tables, and suggested visual aids (described in words) rather than dense paragraphs. ';
  } else if (content_format_preference === 'text') {
    styleInstruction += 'Favor clear, well-organized written explanations for the lecture notes. ';
  }
  if (explanation_complexity_preference === 'simple') {
    styleInstruction += 'Use everyday analogies and simple language throughout lecture notes, flashcards, and quiz explanations — explain as if to someone new to the subject, while still being accurate. ';
  } else if (explanation_complexity_preference === 'advanced') {
    styleInstruction += 'Use precise technical/academic language and assume strong subject familiarity. ';
  }

  let prompt = `Generate study materials for this topic: ${title} - ${description}, part of the subject ${subject_name}.\n\n`;
  if (subject_exam_type) {
    prompt += `\nEXAM BOARD STYLE: Write the quiz questions and flashcards specifically in the style, voice, and difficulty of the ${subject_exam_type} examination board. `;
  }
  if (styleInstruction) prompt += `STYLE INSTRUCTIONS: ${styleInstruction}\n\n`;
  if (generation_depth === 'deep') {
    prompt += `\nDEPTH: The student struggled with this topic in a diagnostic. Please provide DEEP coverage: thorough lecture notes, 12-15 flashcards, and a 5-question quiz. `;
  } else if (generation_depth === 'light') {
    prompt += `\nDEPTH: The student is already familiar with this topic. Please provide LIGHT coverage: a shorter summary-style lecture note (key points, not full explanation), 4-5 flashcards covering only the most essential facts, and a shorter 3-question quiz. `;
  } else {
    prompt += `\nDEPTH: Standard coverage: 8-10 flashcards and a 5-question quiz. `;
  }
  prompt += `Return JSON with: (1) lecture_notes: a clear, well-structured explanation in markdown (a few paragraphs plus key points), (2) flashcards: an array of {question, answer} pairs testing recall of key facts, (3) quiz: an array of multiple-choice questions, each with {question_text, options (4 choices), correct_answer, explanation}.`;

  try {
    const reply = await generate(env, {
      text: prompt,
      schema: {
        type: 'OBJECT',
        properties: {
          lecture_notes: { type: 'STRING' },
          flashcards: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { question: { type: 'STRING' }, answer: { type: 'STRING' } },
              required: ['question', 'answer'],
            },
          },
          quiz: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                question_text: { type: 'STRING' },
                options: { type: 'ARRAY', items: { type: 'STRING' } },
                correct_answer: { type: 'STRING' },
                explanation: { type: 'STRING' },
              },
              required: ['question_text', 'options', 'correct_answer', 'explanation'],
            },
          },
        },
        required: ['lecture_notes', 'flashcards', 'quiz'],
      },
    });
    return json({ result: parseJsonReply(reply.text) });
  } catch (err) {
    return errorResponse(err, 'Failed to generate study materials. Please try again.');
  }
};
