import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

recent_activity_block = """        {/* Recent Activity List */}
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
        </div>"""

content = content.replace(recent_activity_block, "")

# Now insert it before MY CURRICULA
insert_target = """      </div>
      
      {/* MY CURRICULA / SEMESTERS Section */}"""

new_block = """      </div>
      
      {/* Recent Activity List */}
      <div className="mb-12">
        <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">Recent Activity</h2>
        {recentSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recentSessions.map(s => (
              <div key={s.id} className="bg-white p-5 rounded-[1.5rem] border border-border hover:border-ink hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="bg-surface text-ink px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider group-hover:bg-ink group-hover:text-white transition-colors">{s.screen_type}</span>
                     <span className="text-xs font-semibold text-slate-400">{new Date(s.started_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink line-clamp-2 leading-snug mb-4">{s.topic_title}</h4>
                </div>
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : 'In progress'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface p-8 rounded-[2rem] border border-border text-center text-sm font-medium text-slate-500 shadow-sm">
            No recent study sessions. Open a topic to start learning!
          </div>
        )}
      </div>

      {/* MY CURRICULA / SEMESTERS Section */}"""

content = content.replace(insert_target, new_block)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
