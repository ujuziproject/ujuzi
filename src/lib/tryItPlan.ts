// The study plan a visitor builds in "Try it" before signing up.
// Kept in this browser's localStorage so it survives sign-up and onboarding,
// then turned into a real course on their first upload.

export interface TryItTopic {
  subject_name?: string;
  title: string;
  description?: string;
}

export interface TryItPlan {
  name: string;          // the plan name the visitor chose
  text: string;          // what they pasted (empty if they uploaded a file)
  topics: TryItTopic[];  // topics we found for them
  hard: string[];        // titles they marked "hard for me"
  savedAt: number;
}

const KEY = 'ujuzi.tryItPlan';
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

export function loadTryItPlan(): TryItPlan | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const plan = JSON.parse(raw) as TryItPlan;
    if (!plan?.topics?.length || Date.now() - (plan.savedAt || 0) > MAX_AGE_MS) return null;
    return plan;
  } catch {
    return null;
  }
}

export function saveTryItPlan(plan: Omit<TryItPlan, 'savedAt'>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...plan, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private mode etc.) — the plan just won't carry over.
  }
}

export function clearTryItPlan() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// Text to pre-fill the upload box with: what they pasted, or the topics we found
// (when they uploaded a file, which can't be carried across pages).
export function tryItDraftText(plan: TryItPlan): string {
  if (plan.text?.trim()) return plan.text;
  return plan.topics
    .map(t => `${t.subject_name ? `${t.subject_name} — ` : ''}${t.title}${t.description ? `: ${t.description}` : ''}`)
    .join('\n');
}

// Topics the visitor marked as hard get deeper coverage, unless the diagnostic
// already decided otherwise.
export function applyHardTopics<T extends { title?: string; generation_depth?: string }>(topics: T[], hardTitles: string[]): T[] {
  if (!hardTitles?.length) return topics;
  const hard = new Set(hardTitles.map(h => h.trim().toLowerCase()));
  return topics.map(t =>
    t.title && hard.has(t.title.trim().toLowerCase()) && (!t.generation_depth || t.generation_depth === 'standard')
      ? { ...t, generation_depth: 'deep' }
      : t
  );
}
