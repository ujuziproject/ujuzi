import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add state
state_old = "const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });"
state_new = "const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });\n  const [recommendations, setRecommendations] = useState<any[]>([]);"
content = content.replace(state_old, state_new)

# Add fetch logic
fetch_old = """      setTotalQuizzes(quizRes.count || 0);
      setStreak(streaksRes.data?.current_streak || 0);"""
fetch_new = """      setTotalQuizzes(quizRes.count || 0);
      setStreak(streaksRes.data?.current_streak || 0);
      
      const { data: myInterests } = await supabase.from('student_interests').select('interest_id').eq('student_id', userId);
      if (myInterests && myInterests.length > 0) {
        const iIds = myInterests.map(i => i.interest_id);
        const { data: recs } = await supabase.from('interest_content').select('*').in('interest_id', iIds).limit(4);
        if (recs) setRecommendations(recs);
      }
"""
content = content.replace(fetch_old, fetch_new)

# Add rendering below track rendering
render_old = """        ) : (
          <>
            <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Curricula</h2>
            {curricula.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {curricula.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openCurriculum(c.id)}
                    className="flex flex-col text-left p-6 bg-white rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
                  >
                    <h3 className="text-lg font-bold text-ink mb-1 font-display">{c.title}</h3>
                    <div className="flex items-center justify-between w-full mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Layers className="w-4 h-4" />
                        <span className="font-mono">{c.topic_count} Topics</span>
                      </div>
                      <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Curricula</h3>
                <p className="text-slate-500 font-medium mb-6">Upload your first curriculum to start learning.</p>
                <button 
                  onClick={() => setView('upload')}
                  className="bg-ink text-white px-8 py-3.5 rounded-full font-bold hover:bg-ink/90 transition-colors"
                >
                  + Upload Curriculum
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}"""

render_new = """        ) : (
          <>
            <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Curricula</h2>
            {curricula.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {curricula.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openCurriculum(c.id)}
                    className="flex flex-col text-left p-6 bg-white rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
                  >
                    <h3 className="text-lg font-bold text-ink mb-1 font-display">{c.title}</h3>
                    <div className="flex items-center justify-between w-full mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Layers className="w-4 h-4" />
                        <span className="font-mono">{c.topic_count} Topics</span>
                      </div>
                      <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Curricula</h3>
                <p className="text-slate-500 font-medium mb-6">Upload your first curriculum to start learning.</p>
                <button 
                  onClick={() => setView('upload')}
                  className="bg-ink text-white px-8 py-3.5 rounded-full font-bold hover:bg-ink/90 transition-colors"
                >
                  + Add Materials
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Recommended for You */}
        <div className="mt-12 mb-8">
          <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">Recommended for You</h2>
          {recommendations.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {recommendations.map(r => (
                <a 
                  key={r.id} 
                  href={r.content_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col bg-white rounded-2xl border border-border hover:border-accent hover:shadow-md transition-all overflow-hidden group"
                >
                  {r.image_url && (
                    <div className="h-32 w-full bg-slate-100 relative overflow-hidden">
                      <img src={r.image_url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-ink line-clamp-2 mb-2 leading-snug">{r.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{r.summary}</p>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Read More</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <p className="text-slate-500 font-medium">Personalized reading recommendations are coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}"""

content = content.replace(render_old, render_new)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
