import { json, readJson, errorResponse, type Env, type Data } from '../_lib/env';
import { generate, type GenerateResult } from '../_lib/gemini';

// Searches the web for a course's official outline. If none is found, writes a
// standard syllabus instead — and says so honestly (isReal: false).
export const onRequestPost: PagesFunction<Env, string, Data> = async ({ request, env }) => {
  const body = await readJson<{ courseName?: string; university?: string; faculty?: string; courseOfStudy?: string }>(request);
  const courseName = body?.courseName?.trim();
  if (!courseName || courseName.length > 300) return json({ error: 'Please enter a course name.' }, 400);
  const { university, faculty, courseOfStudy } = body!;

  const contextStr = university
    ? `This is for a university student at ${university}, Faculty of ${faculty}, studying ${courseOfStudy}.`
    : '';

  const searchPrompt = `Find the official course outline or curriculum for the course "${courseName}"${university ? ` at ${university}` : ''}. ${contextStr} If you find a reliable real curriculum, summarize it into a structured text syllabus. If you cannot find a specific one for this university, generate a high-quality standard syllabus for this course at this level.
      IMPORTANT: Your response MUST start with either [REAL] if you found and are summarizing an actual curriculum from search, or [FALLBACK] if you are generating a general one. Following that tag, provide the full text of the curriculum/syllabus.`;

  try {
    // Search the web first. If search isn't available, fall back to a general syllabus.
    let reply: GenerateResult;
    let searched = true;
    try {
      reply = await generate(env, { text: searchPrompt, googleSearch: true });
    } catch (searchErr: any) {
      console.warn('Google Search grounding failed, using general syllabus:', searchErr?.message);
      searched = false;
      reply = await generate(env, { text: searchPrompt });
    }

    const claimedReal = reply.text.startsWith('[REAL]');
    const text = reply.text.replace(/^\[(REAL|FALLBACK)\]/, '').trim();
    // Only call it "real" if the model said so AND it actually cited web sources.
    const isReal = searched && claimedReal && reply.sources.length > 0;
    return json({ text, isReal, sources: isReal ? reply.sources.slice(0, 5) : [] });
  } catch (err) {
    return errorResponse(err, 'Failed to find a curriculum. Please try again.');
  }
};
