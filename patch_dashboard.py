import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Add masteryStats state
state_match = re.search(r'const \[streak, setStreak\] = useState\(0\);', content)
if state_match:
    content = content[:state_match.end()] + '\n  const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });' + content[state_match.end():]

# 2. Add calculation in fetchDashboardData
calc_code = """
    // calculate mastery
    let notStarted = 0;
    let inProgress = 0;
    let mastered = 0;
    
    const curriculumIds = currsList.map(c => c.id);
    if (curriculumIds.length > 0) {
      const { data: allTopics } = await supabase.from('topics').select('id, curriculum_id').in('curriculum_id', curriculumIds);
      if (allTopics && allTopics.length > 0) {
         const topicIds = allTopics.map(t => t.id);
         const { data: topicQuizzes } = await supabase.from('quizzes').select('id, topic_id').in('topic_id', topicIds);
         const { data: attempts } = await supabase.from('quiz_attempts').select('quiz_id, score').eq('student_id', userId);
         
         const topicStatus = new Map<string, { attempted: boolean, maxScore: number }>();
         topicIds.forEach(id => topicStatus.set(id, { attempted: false, maxScore: 0 }));
         
         if (topicQuizzes && attempts) {
             attempts.forEach(attempt => {
                 const q = topicQuizzes.find(tq => tq.id === attempt.quiz_id);
                 if (q) {
                     const status = topicStatus.get(q.topic_id);
                     if (status) {
                         status.attempted = true;
                         if (attempt.score > status.maxScore) status.maxScore = attempt.score;
                     }
                 }
             });
         }
         
         for (const [id, status] of Array.from(topicStatus.entries())) {
             if (!status.attempted) notStarted++;
             else if (status.maxScore >= 80) mastered++;
             else inProgress++;
         }
      }
    }
    
    const totalTopicsMastery = notStarted + inProgress + mastered || 1;
    setMasteryStats({
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    });
"""

streak_calc = re.search(r'setStreak\(streakData\?.current_streak \|\| 0\);', content)
if streak_calc:
    content = content[:streak_calc.end()] + calc_code + content[streak_calc.end():]

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
