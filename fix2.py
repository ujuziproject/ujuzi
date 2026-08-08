import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

target = "    setMasteryStats(newMastery);\n\n    dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });"

replacement = """    setMasteryStats(newMastery);
    
    // Fetch recent activity
    let formattedRecentSessions: any[] = [];
    const { data: recentSessionsData } = await supabase.from('study_sessions').select('*').eq('student_id', userId).not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(5);
    if (recentSessionsData && recentSessionsData.length > 0) {
      const topicIds = recentSessionsData.map(s => s.topic_id);
      const { data: topicsList } = await supabase.from('topics').select('id, title').in('id', topicIds);
      formattedRecentSessions = recentSessionsData.map(s => {
        const t = (topicsList || []).find(x => x.id === s.topic_id);
        return {
          ...s,
          topic_title: t ? t.title : 'Unknown Topic'
        };
      });
    }
    setRecentSessions(formattedRecentSessions);

    dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });"""

content = content.replace(target, replacement)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
