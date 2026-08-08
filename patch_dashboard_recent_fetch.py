import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

fetch_old = """    const newMastery = { 
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);"""

fetch_new = """    const newMastery = { 
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);
    
    // Fetch recent activity
    const { data: recentSessionsData } = await supabase.from('study_sessions').select('*').eq('student_id', userId).not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(5);
    let formattedRecentSessions = [];
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
    setRecentSessions(formattedRecentSessions);"""
content = content.replace(fetch_old, fetch_new)

cache_set_old = "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery });"
cache_set_new = "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });"

# Notice that `recs` is defined in fetch_old which was earlier, we need to make sure `recs` is available. Let's look at it.
