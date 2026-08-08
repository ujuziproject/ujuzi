import { supabase } from './supabase';

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

    const todayStr = new Date().toISOString().split('T')[0];

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
        const lastDate = new Date(lastActive);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

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
  } catch (err) {
    console.error('Failed to record activity:', err);
  }
}
