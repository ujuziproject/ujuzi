import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix the state that got malformed with a literal newline:
content = content.replace("useState<any[]>([]);\\n  const [recentSessions", "useState<any[]>([]);\n  const [recentSessions")

# 1. Fetch recommendations
fetch_str_old = """    // Streak
    const { data: streakData } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
    setStreak(streakData?.current_streak || 0);"""

fetch_str_new = """    // Streak
    const { data: streakData } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
    setStreak(streakData?.current_streak || 0);
    
    // Recommendations
    let recs: any[] = [];
    const { data: myInterests } = await supabase.from('student_interests').select('interest_id').eq('student_id', userId);
    if (myInterests && myInterests.length > 0) {
      const iIds = myInterests.map(i => i.interest_id);
      const { data: fetchRecs } = await supabase.from('interest_content').select('*').in('interest_id', iIds).limit(4);
      if (fetchRecs) {
          recs = fetchRecs;
          setRecommendations(recs);
      }
    }"""
content = content.replace(fetch_str_old, fetch_str_new)

# 2. Add recent sessions rendering below Hero Cards
render_old = """        {/* Allocation Card */}
        <div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">"""

render_new = """        {/* Recent Activity List */}
        <div className="col-span-1 lg:col-span-3 mt-4 mb-4">
          <h2 className="text-xl font-bold text-ink mb-4 font-display">Recent Activity</h2>
          {recentSessions.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {recentSessions.map(s => (
                <div key={s.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="bg-surface text-ink px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{s.screen_type}</span>
                       <span className="text-xs text-slate-400">{new Date(s.started_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-ink line-clamp-2 leading-tight">{s.topic_title}</h4>
                  </div>
                  <div className="mt-3 text-xs font-semibold text-slate-500">
                    {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : 'In progress'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface p-4 rounded-xl border border-border text-center text-sm text-slate-500">
              No recent study sessions. Open a topic to start learning!
            </div>
          )}
        </div>
        
        {/* Allocation Card */}
        <div className="col-span-1 bg-white rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">"""
content = content.replace(render_old, render_new)

# Fix cache setting
cache_old = "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery });"
cache_new = "dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });"
content = content.replace(cache_old, cache_new)


with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
