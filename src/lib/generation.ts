import { supabase } from './supabase';
import { authFetch, apiError } from './api';

export interface GenerationPrefs {
  contentFormat?: string;
  explanationComplexity?: string;
}

export interface PreviewCard {
  topicTitle: string;
  question: string;
  answer: string;
}

export type GenerationOutcome =
  | { ok: true; cards: PreviewCard[] }
  | { ok: false; error: string };

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

    const cards: PreviewCard[] = [];
    if (Array.isArray(m?.flashcards) && m.flashcards.length > 0) {
      const { error } = await supabase.from('flashcards').insert(
        m.flashcards.map((fc: any) => ({ topic_id: topic.id, question: fc.question, answer: fc.answer }))
      );
      if (error) throw new Error(`Couldn't save the flashcards: ${error.message}`);
      for (const fc of m.flashcards.slice(0, 3)) {
        if (fc?.question && fc?.answer) cards.push({ topicTitle: topic.title, question: fc.question, answer: fc.answer });
      }
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

    return { ok: true, cards };
  } catch (err: any) {
    console.warn('Material generation failed for topic', topic?.id, err);
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}

export type TopicStatus = 'queued' | 'working' | 'done' | 'failed';

export interface GenerationCallbacks {
  onTopicStatus?: (topicId: string, status: TopicStatus) => void;
  onCards?: (cards: PreviewCard[]) => void;
}

// How many topics to generate at the same time. Three keeps things roughly
// three times faster without tripping the AI service's rate limits.
const CONCURRENCY = 3;

// Generates materials for every topic (a few at a time) and returns the ones that failed.
export async function generateForTopics(
  topics: any[],
  prefs: GenerationPrefs,
  callbacks: GenerationCallbacks = {}
): Promise<{ failed: any[]; firstError: string }> {
  const failed: any[] = [];
  let firstError = '';
  let next = 0;

  const worker = async () => {
    while (next < topics.length) {
      const topic = topics[next++];
      callbacks.onTopicStatus?.(topic.id, 'working');
      const outcome = await generateAndSaveMaterials(topic, prefs);
      if ('error' in outcome) {
        failed.push(topic);
        if (!firstError) firstError = outcome.error;
        callbacks.onTopicStatus?.(topic.id, 'failed');
      } else {
        callbacks.onTopicStatus?.(topic.id, 'done');
        if (outcome.cards.length) callbacks.onCards?.(outcome.cards);
      }
    }
  };

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, topics.length) }, worker));
  // Keep failures in the original topic order
  failed.sort((a, b) => topics.indexOf(a) - topics.indexOf(b));
  return { failed, firstError };
}
