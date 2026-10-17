import re

with open('src/components/MainApp.tsx', 'r') as f:
    content = f.read()

old_load = """  useEffect(() => {
    async function loadData() {
      const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).maybeSingle();
      if (profile?.track) setTrack(profile.track);

      const { data: streaks } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
      const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: flashcardCount } = await supabase.from('flashcard_reviews').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: interestCount } = await supabase.from('student_interests').select('*', { count: 'exact', head: true }).eq('student_id', userId);
      const { count: currCount } = await supabase.from('curricula').select('*', { count: 'exact', head: true }).eq('student_id', userId);

      const streakDays = streaks?.current_streak || 0;
      const quizzes = quizCount || 0;
      const flashcards = flashcardCount || 0;
      const interests = interestCount || 0;
      const curricula = currCount || 0;"""

new_load = """  useEffect(() => {
    async function loadData() {
      const [profileRes, streaksRes, quizRes, flashcardRes, interestRes, currRes] = await Promise.all([
        supabase.from('student_profiles').select('track').eq('id', userId).maybeSingle(),
        supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle(),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('flashcard_reviews').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('student_interests').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('curricula').select('*', { count: 'exact', head: true }).eq('student_id', userId)
      ]);
      
      if (profileRes.data?.track) setTrack(profileRes.data.track);

      const streakDays = streaksRes.data?.current_streak || 0;
      const quizzes = quizRes.count || 0;
      const flashcards = flashcardRes.count || 0;
      const interests = interestRes.count || 0;
      const curricula = currRes.count || 0;"""

content = content.replace(old_load, new_load)

with open('src/components/MainApp.tsx', 'w') as f:
    f.write(content)
