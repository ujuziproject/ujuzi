import { supabase } from './supabase';
import { authFetch, apiError } from './api';

export interface GenerationPrefs {
  contentFormat?: string;
  explanationComplexity?: string;
}

export type GenerationOutcome = { ok: true } | { ok: false; error: string };

// Generates notes, flashcards and a quiz for one topic and saves them.
// Never throws: returns { ok: false, error } with a readable reason instead,
// so the caller can tell the student exactly what went wrong.
export async function generateAndSaveMaterials(topic: any, prefs: GenerationPrefs = {}): Promise<GenerationOutcome> {
  try {
    const res = await authFetch('/api/generate-materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: topic.title,
        description: topic.description,
        subject_name: topic.subject_name,
        subject_exam_type: topic.subject_exam_type,
        generation_depth: topic.generation_depth,
        content_format_preference: prefs.contentFormat,
        explanation_complexity_preference: prefs.explanationComplexity,
      }),
    });
    if (!res.ok) throw await apiError(res, `The AI couldn't generate materials (error ${res.status}).`);
    const { result: m } = await res.json();

    if (m?.lecture_notes) {
      const { error } = await supabase.from('lecture_notes').insert({ topic_id: topic.id, content: m.lecture_notes });
      if (error) throw new Error(`Couldn't save the notes: ${error.message}`);
    }

    if (Array.isArray(m?.flashcards) && m.flashcards.length > 0) {
      const { error } = await supabase.from('flashcards').insert(
        m.flashcards.map((fc: any) => ({ topic_id: topic.id, question: fc.question, answer: fc.answer }))
      );
      if (error) throw new Error(`Couldn't save the flashcards: ${error.message}`);
    }

    if (Array.isArray(m?.quiz) && m.quiz.length > 0) {
      const { data: quiz, error } = await supabase.from('quizzes').insert({ topic_id: topic.id, title: `${topic.title} Quiz` }).select().single();
      if (error || !quiz) throw new Error(`Couldn't save the quiz: ${error?.message || 'unknown error'}`);
      const { error: qErr } = await supabase.from('quiz_questions').insert(
        m.quiz.map((q: any, i: number) => ({
          quiz_id: quiz.id,
          question_text: q.question_text,
          options: q.options || [],
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          order_index: i,
        }))
      );
      if (qErr) throw new Error(`Couldn't save the quiz questions: ${qErr.message}`);
    }

    return { ok: true };
  } catch (err: any) {
    console.warn('Material generation failed for topic', topic?.id, err);
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}

// Runs generation for a list of topics, reporting progress, and returns the topics that failed.
export async function generateForTopics(
  topics: any[],
  prefs: GenerationPrefs,
  onProgress: (done: number, total: number) => void
): Promise<{ failed: any[]; firstError: string }> {
  const failed: any[] = [];
  let firstError = '';
  for (let i = 0; i < topics.length; i++) {
    onProgress(i + 1, topics.length);
    const outcome = await generateAndSaveMaterials(topics[i], prefs);
    if ('error' in outcome) {
      failed.push(topics[i]);
      if (!firstError) firstError = outcome.error;
    }
  }
  return { failed, firstError };
}
