import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """    const newMastery = { 
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);"""

replacement = """    const newMastery = { 
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);
    
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
    setRecentSessions(formattedRecentSessions);"""

content = content.replace(target, replacement)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
