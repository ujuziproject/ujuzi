import { supabase } from './supabase';
import { localDateStr, addDays } from './dates';

export async function checkAndAwardBadges(userId: string) {
  try {
    const { data: allBadges } = await supabase.from('badges').select('*');
    if (!allBadges) return [];

    const { data: studentBadges } = await supabase.from('student_badges').select('badge_id').eq('student_id', userId);
    const earnedBadgeIds = new Set(studentBadges?.map(sb => sb.badge_id) || []);

    const unearnedBadges = allBadges.filter(b => !earnedBadgeIds.has(b.id));
    if (unearnedBadges.length === 0) return [];

    const criteriaNeeded = new Set(unearnedBadges.map(b => b.criteria_type));
    const newEarned = [];

    // 1. Streak check
    if (criteriaNeeded.has('streak_days')) {
      const { data: streakData } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
      if (streakData) {
        for (const b of unearnedBadges.filter(b => b.criteria_type === 'streak_days')) {
          if (streakData.current_streak >= b.threshold) newEarned.push(b);
        }
      }
    }

    // 2. Quiz Score
    if (criteriaNeeded.has('quiz_score_90')) {
      const { data: attempts } = await supabase.from('quiz_attempts').select('score, total_questions').eq('student_id', userId);
      if (attempts && attempts.length > 0) {
        const has90 = attempts.some(a => (a.score / a.total_questions) * 100 >= 90);
        if (has90) {
           for (const b of unearnedBadges.filter(b => b.criteria_type === 'quiz_score_90')) {
              newEarned.push(b);
           }
        }
      }
    }

    // 3. Topics / Courses Mastery (complex calculation, simplified for badge)
    if (criteriaNeeded.has('topics_mastered') || criteriaNeeded.has('courses_completed')) {
      // get all flashcards
      const { data: flashcards } = await supabase.from('flashcards').select('id, topic_id');
      const { data: reviews } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days').eq('student_id', userId).gte('interval_days', 14);
      
      const masteredFcIds = new Set((reviews || []).map(r => r.flashcard_id));
      
      // group FCs by topic
      const topicFcs = new Map();
      for (const fc of (flashcards || [])) {
         if (!topicFcs.has(fc.topic_id)) topicFcs.set(fc.topic_id, []);
         topicFcs.get(fc.topic_id).push(fc.id);
      }

      let masteredTopicsCount = 0;
      const masteredTopicIds = new Set();
      for (const [tId, fcIds] of topicFcs.entries()) {
         if (fcIds.length > 0 && fcIds.every((id: string) => masteredFcIds.has(id))) {
            masteredTopicsCount++;
            masteredTopicIds.add(tId);
         }
      }

      for (const b of unearnedBadges.filter(b => b.criteria_type === 'topics_mastered')) {
         if (masteredTopicsCount >= b.threshold) newEarned.push(b);
      }

      if (criteriaNeeded.has('courses_completed')) {
         const { data: topics } = await supabase.from('topics').select('id, course_id');
         const courseTopics = new Map();
         for (const t of (topics || [])) {
            if (!t.course_id) continue;
            if (!courseTopics.has(t.course_id)) courseTopics.set(t.course_id, []);
            courseTopics.get(t.course_id).push(t.id);
         }

         let masteredCoursesCount = 0;
         for (const [cId, tIds] of courseTopics.entries()) {
            if (tIds.length > 0 && tIds.every((id: string) => masteredTopicIds.has(id))) {
               masteredCoursesCount++;
            }
         }

         for (const b of unearnedBadges.filter(b => b.criteria_type === 'courses_completed')) {
            if (masteredCoursesCount >= b.threshold) newEarned.push(b);
         }
      }
    }

    // 4. Flashcard Days 5 (5 consecutive days with flashcard_reviews)
    if (criteriaNeeded.has('flashcard_days_5')) {
       // We can approximate this by checking streak_days >= 5, but let's see if we can do exactly flashcard reviews
       // Or easier: activity_log with type 'flashcard_reviewed' on 5 distinct consecutive dates
       const { data: logs } = await supabase.from('activity_log')
         .select('occurred_at')
         .eq('student_id', userId)
         .eq('activity_type', 'flashcard_reviewed')
         .order('occurred_at', { ascending: false });
         
       if (logs && logs.length > 0) {
          const dates = [...new Set(logs.map(l => localDateStr(new Date(l.occurred_at))))].sort().reverse();
          let maxConsecutive = 1;
          let current = 1;
          for (let i = 0; i < dates.length - 1; i++) {
             const d1 = new Date(dates[i]);
             const d2 = new Date(dates[i+1]);
             const diff = (d1.getTime() - d2.getTime()) / (1000*60*60*24);
             if (diff === 1) {
                current++;
                if (current > maxConsecutive) maxConsecutive = current;
             } else {
                current = 1;
             }
          }
          for (const b of unearnedBadges.filter(b => b.criteria_type === 'flashcard_days_5')) {
             if (maxConsecutive >= b.threshold) newEarned.push(b);
          }
       }
    }

    // 5. Perfect Week (activity on all 7 of last 7 calendar days)
    if (criteriaNeeded.has('perfect_week')) {
       const sixDaysAgo = addDays(new Date(), -6);
       sixDaysAgo.setHours(0, 0, 0, 0);
       const { data: logs } = await supabase.from('activity_log')
         .select('occurred_at')
         .eq('student_id', userId)
         .gte('occurred_at', sixDaysAgo.toISOString());
         
       if (logs && logs.length > 0) {
          const dates = new Set(logs.map(l => localDateStr(new Date(l.occurred_at))));
          for (const b of unearnedBadges.filter(b => b.criteria_type === 'perfect_week')) {
             if (dates.size >= 7) newEarned.push(b);
          }
       }
    }

    // Award new badges
    if (newEarned.length > 0) {
       const inserts = newEarned.map(b => ({
          student_id: userId,
          badge_id: b.id
       }));
       await supabase.from('student_badges').insert(inserts);
       return newEarned;
    }
    return [];
  } catch (err) {
    console.error('Failed to check badges:', err);
    return [];
  }
}
