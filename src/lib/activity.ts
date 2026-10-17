import { checkAndAwardBadges } from './badges';
import { supabase } from './supabase';
import { localDateStr, parseLocalDate } from './dates';

export type ActivityType = 'login' | 'quiz_completed' | 'flashcard_reviewed' | 'material_generated' | 'curriculum_uploaded';

export async function recordActivity(studentId: string, activityType: ActivityType, metadata?: any) {
  try {
    // 1. Insert activity log
    await supabase.from('activity_log').insert({
      student_id: studentId,
      activity_type: activityType,
      metadata: metadata || null
    });

    // 2. Update streaks
    // Fetch current streak
    const { data: streakData } = await supabase
      .from('streaks')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    const todayStr = localDateStr();

    if (!streakData) {
      // Insert new streak
      await supabase.from('streaks').insert({
        student_id: studentId,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: todayStr
      });
    } else {
      const lastActive = streakData.last_active_date;
      if (lastActive !== todayStr) {
        // Calculate difference in days
        const lastDate = parseLocalDate(lastActive);
        const today = parseLocalDate(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

        let newCurrentStreak = streakData.current_streak;
        
        if (diffDays === 1) {
          // Continuous streak
          newCurrentStreak += 1;
        } else if (diffDays > 1) {
          // Streak broken
          newCurrentStreak = 1;
        }

        const newLongestStreak = Math.max(streakData.longest_streak, newCurrentStreak);

        await supabase.from('streaks').update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_active_date: todayStr
        }).eq('student_id', studentId);
      }
    }
    // 3. Check for newly earned badges
    const newBadges = await checkAndAwardBadges(studentId);
    if (newBadges && newBadges.length > 0) {
       // Dispatch custom event to trigger toast in UI
       if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('badgesAwarded', { detail: newBadges }));
       }
    }
  } catch (err) {
    console.error('Failed to record activity:', err);
  }
}
