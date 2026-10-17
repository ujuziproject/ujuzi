import { supabase } from './supabase';
import { localDateStr, parseLocalDate, addDays, daysUntil } from './dates';

// Builds (or rebuilds) the student's study plan in planner_items.
//
// Rules:
//  - Only topics that are not yet mastered are scheduled.
//  - Each new topic gets three tasks: read the notes (day D), review its flashcards
//    (day D+1) and take its quiz (day D+3) — spaced repetition, not cramming.
//  - At most 2 NEW topics per day. New topics are spread evenly across the days available.
//  - The final days before the target date are review-only (no new topics):
//    3 days if there are 10+ days left, 1 day if 4–9 days left, none otherwise.
//  - "Adjust plan" deletes only FUTURE, UNCOMPLETED tasks for these topics and rebuilds them.
//    Completed tasks and tasks the student added by hand are never touched.

type PlanResult = { success: true; scheduled: number; overloaded: boolean } | { error: string };

export async function adjustStudyPlan(userId: string, track: string): Promise<PlanResult> {
  let target: Date | null = null;
  let topicIds: string[] = [];

  if (track === 'university') {
    const { data: sems } = await supabase.from('semesters').select('id, target_end_date').eq('student_id', userId)
      .order('level_year', { ascending: false }).order('semester_number', { ascending: false }).limit(1);
    if (!sems || sems.length === 0) return { error: 'Create a semester first, then we can build your plan.' };
    if (!sems[0].target_end_date) return { error: 'Set the date your semester ends so we can pace your plan.' };
    target = parseLocalDate(sems[0].target_end_date);
    const { data: courses } = await supabase.from('courses').select('id').eq('semester_id', sems[0].id);
    if (courses && courses.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('course_id', courses.map(c => c.id)).order('order_index', { ascending: true });
      topicIds = (topics || []).map(t => t.id);
    }
  } else if (track === 'independent') {
    const { data: goals } = await supabase.from('learning_goals').select('id, target_date').eq('student_id', userId)
      .order('created_at', { ascending: false }).limit(1);
    if (!goals || goals.length === 0) return { error: 'Create a learning goal first, then we can build your plan.' };
    if (!goals[0].target_date) return { error: 'Set a target date for your goal so we can pace your plan.' };
    target = parseLocalDate(goals[0].target_date);
    const { data: courses } = await supabase.from('courses').select('id').eq('goal_id', goals[0].id);
    if (courses && courses.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('course_id', courses.map(c => c.id)).order('order_index', { ascending: true });
      topicIds = (topics || []).map(t => t.id);
    }
  } else {
    const { data: profile } = await supabase.from('student_profiles').select('exam_date, exam_year').eq('id', userId).maybeSingle();
    if (profile?.exam_date) target = parseLocalDate(profile.exam_date);
    else if (profile?.exam_year) target = new Date(profile.exam_year, 5, 30); // approximate: 30 June
    else return { error: 'Add your exam date in Settings so we can pace your plan.' };
    const { data: curricula } = await supabase.from('curricula').select('id').eq('student_id', userId);
    if (curricula && curricula.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('curriculum_id', curricula.map(c => c.id)).order('order_index', { ascending: true });
      topicIds = (topics || []).map(t => t.id);
    }
  }

  if (topicIds.length === 0) return { error: 'Add a course with topics first, then we can build your plan.' };

  const daysLeft = daysUntil(target);
  if (daysLeft < 1) return { error: 'Your target date has passed. Update it to build a new plan.' };

  // A topic counts as mastered when every one of its flashcards has a review interval of 14+ days
  const { data: flashcards } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', topicIds);
  let remaining = [...topicIds];
  if (flashcards && flashcards.length > 0) {
    const { data: reviews } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days')
      .eq('student_id', userId).in('flashcard_id', flashcards.map(f => f.id)).gte('interval_days', 14);
    const masteredCards = new Set((reviews || []).map(r => r.flashcard_id));
    remaining = topicIds.filter(tId => {
      const cards = flashcards.filter(f => f.topic_id === tId);
      return !(cards.length > 0 && cards.every(c => masteredCards.has(c.id)));
    });
  }

  // Clear future, uncompleted, auto-generated tasks for these topics (hand-added tasks have no topic_id)
  const todayStr = localDateStr();
  const { error: delError } = await supabase.from('planner_items').delete()
    .eq('student_id', userId).eq('completed', false).in('topic_id', topicIds).gte('scheduled_date', todayStr);
  if (delError) return { error: 'Could not update your plan. Please try again.' };

  if (remaining.length === 0) return { success: true, scheduled: 0, overloaded: false };

  const { data: topicDetails } = await supabase.from('topics').select('id, title').in('id', remaining);
  const titleOf = new Map((topicDetails || []).map(t => [t.id, t.title]));

  // Day 0 = today. Last schedulable day = the day before the target date.
  const lastDay = Math.max(0, daysLeft - 1);
  const reviewDays = daysLeft >= 10 ? 3 : daysLeft >= 4 ? 1 : 0;
  const newTopicDays = Math.max(1, lastDay + 1 - reviewDays); // days 0 .. newTopicDays-1 take new topics
  const overloaded = remaining.length > newTopicDays * 2;

  const today = parseLocalDate(todayStr);
  const dateFor = (offset: number) => localDateStr(addDays(today, Math.min(offset, lastDay)));
  const perDay = new Map<number, number>();
  const rows: any[] = [];

  remaining.forEach((topicId, i) => {
    // Spread evenly, then push forward if that day already has 2 new topics
    let day = Math.floor((i * newTopicDays) / remaining.length);
    while ((perDay.get(day) || 0) >= 2 && day < newTopicDays - 1) day++;
    perDay.set(day, (perDay.get(day) || 0) + 1);

    const title = titleOf.get(topicId) || 'Topic';
    rows.push({ student_id: userId, topic_id: topicId, item_type: 'notes', title: `Study: ${title}`, scheduled_date: dateFor(day), completed: false });
    rows.push({ student_id: userId, topic_id: topicId, item_type: 'flashcards', title: `Flashcards: ${title}`, scheduled_date: dateFor(day + 1), completed: false });
    rows.push({ student_id: userId, topic_id: topicId, item_type: 'quiz', title: `Quiz: ${title}`, scheduled_date: dateFor(day + 3), completed: false });
  });

  // Review-only final days: retake quizzes, a few topics per day
  if (reviewDays > 0) {
    const perReviewDay = Math.max(1, Math.min(3, Math.ceil(remaining.length / reviewDays)));
    for (let r = 0; r < reviewDays; r++) {
      const day = newTopicDays + r;
      remaining.slice(r * perReviewDay, (r + 1) * perReviewDay).forEach(topicId => {
        rows.push({ student_id: userId, topic_id: topicId, item_type: 'quiz', title: `Review quiz: ${titleOf.get(topicId) || 'Topic'}`, scheduled_date: dateFor(day), completed: false });
      });
    }
  }

  const { error: insError } = await supabase.from('planner_items').insert(rows);
  if (insError) return { error: 'Could not save your plan. Please try again.' };

  return { success: true, scheduled: remaining.length, overloaded };
}
