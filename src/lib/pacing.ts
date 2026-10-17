import { supabase } from './supabase';

export async function adjustStudyPlan(userId: string, track: string) {
  // Determine target date and topics
  let targetDate: Date | null = null;
  let topicIds: string[] = [];

  if (track === 'university') {
    const { data: sems } = await supabase.from('semesters').select('id, target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).limit(1);
    if (!sems || sems.length === 0) return { error: 'No semester found' };
    const sem = sems[0];
    if (!sem.target_end_date) return { error: 'No target_end_date set' };
    targetDate = new Date(sem.target_end_date);
    
    const { data: courses } = await supabase.from('courses').select('id').eq('semester_id', sem.id);
    if (courses && courses.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('course_id', courses.map(c => c.id));
      if (topics) topicIds = topics.map(t => t.id);
    }
  } else if (track === 'independent') {
    const { data: goals } = await supabase.from('learning_goals').select('id, target_date').eq('student_id', userId).order('created_at', { ascending: false }).limit(1);
    if (!goals || goals.length === 0) return { error: 'No goal found' };
    const goal = goals[0];
    if (!goal.target_date) return { error: 'No target_date set' };
    targetDate = new Date(goal.target_date);
    
    const { data: courses } = await supabase.from('courses').select('id').eq('goal_id', goal.id);
    if (courses && courses.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('course_id', courses.map(c => c.id));
      if (topics) topicIds = topics.map(t => t.id);
    }
  } else {
    const { data: profile } = await supabase.from('student_profiles').select('exam_date, exam_year').eq('id', userId).single();
    if (profile?.exam_date) {
      targetDate = new Date(profile.exam_date);
    } else if (profile?.exam_year) {
      targetDate = new Date(`${profile.exam_year}-06-30`);
    } else {
      const thisYear = new Date().getFullYear();
      targetDate = new Date(`${thisYear}-06-30`);
    }
    
    const { data: curricula } = await supabase.from('curricula').select('id').eq('student_id', userId);
    if (curricula && curricula.length > 0) {
      const { data: topics } = await supabase.from('topics').select('id').in('curriculum_id', curricula.map(c => c.id));
      if (topics) topicIds = topics.map(t => t.id);
    }
  }

  if (!targetDate || topicIds.length === 0) return { error: 'Missing target date or topics' };

  // Get mastered topics
  const { data: flashcards } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', topicIds);
  let unmasteredTopicIds = [...topicIds];
  
  if (flashcards && flashcards.length > 0) {
    const { data: reviews } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days').eq('student_id', userId).in('flashcard_id', flashcards.map(f => f.id));
    const masteredCards = new Set((reviews || []).filter(r => r.interval_days >= 14).map(r => r.flashcard_id));
    
    unmasteredTopicIds = topicIds.filter(tId => {
      const tCards = flashcards.filter(f => f.topic_id === tId);
      const isMastered = tCards.length > 0 && tCards.every(fc => masteredCards.has(fc.id));
      return !isMastered;
    });
  }

  // Delete future uncompleted planner items for these topics
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('planner_items')
    .delete()
    .eq('student_id', userId)
    .eq('completed', false)
    .in('topic_id', topicIds)
    .gte('scheduled_date', today);

  // Pacing Algorithm
  const remainingTopics = unmasteredTopicIds.length;
  if (remainingTopics === 0) return { success: true };

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysRemaining = Math.max(1, Math.ceil((targetDate.getTime() - new Date().getTime()) / msPerDay));
  
  // We want to leave the last few days (e.g., 3 days) for review
  const availableDays = Math.max(1, daysRemaining - 3);
  
  let topicsPerDay = remainingTopics / availableDays;
  let interval = 1;
  let batchSize = 1;

  if (topicsPerDay >= 2) {
    batchSize = 2;
    interval = 1;
  } else if (topicsPerDay >= 1) {
    batchSize = 1;
    interval = 1;
  } else if (topicsPerDay >= 0.5) {
    batchSize = 1;
    interval = 2;
  } else {
    batchSize = 1;
    interval = 3;
  }

  let currentDate = new Date();
  
  // Create planner items
  const newItems = [];
  let topicIndex = 0;
  
  while (topicIndex < remainingTopics) {
    for (let i = 0; i < batchSize && topicIndex < remainingTopics; i++) {
      const tId = unmasteredTopicIds[topicIndex];
      newItems.push({
        student_id: userId,
        topic_id: tId,
        item_type: 'notes',
        title: `Study new topic`,
        scheduled_date: currentDate.toISOString().split('T')[0],
        completed: false
      });
      topicIndex++;
    }
    currentDate.setDate(currentDate.getDate() + interval);
    if (currentDate >= targetDate) break; // Don't schedule past target date
  }

  // If there are still topics left (due to hitting target date), cram them in the last available days before target date
  if (topicIndex < remainingTopics) {
     let cramDate = new Date(targetDate);
     cramDate.setDate(cramDate.getDate() - 3); // start cramming 3 days before
     while (topicIndex < remainingTopics) {
         newItems.push({
            student_id: userId,
            topic_id: unmasteredTopicIds[topicIndex],
            item_type: 'notes',
            title: `Study new topic`,
            scheduled_date: cramDate.toISOString().split('T')[0],
            completed: false
          });
          topicIndex++;
          cramDate.setDate(cramDate.getDate() + 1);
          if (cramDate > targetDate) cramDate = new Date(targetDate);
     }
  }

  // To fix titles, we need the topic titles
  const { data: topicDetails } = await supabase.from('topics').select('id, title').in('id', unmasteredTopicIds);
  const titleMap = new Map((topicDetails || []).map(t => [t.id, t.title]));

  const inserts = newItems.map(item => ({
    ...item,
    title: `Study: ${titleMap.get(item.topic_id) || 'New Topic'}`
  }));

  if (inserts.length > 0) {
    await supabase.from('planner_items').insert(inserts);
  }

  return { success: true };
}
