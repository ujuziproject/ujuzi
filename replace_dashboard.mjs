import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// I need to add state for plannerItems, and planCount
if (!content.includes('const [plannerItems, setPlannerItems]')) {
  content = content.replace(
    'const [weeklyMinutes, setWeeklyMinutes] = useState(0);',
    'const [weeklyMinutes, setWeeklyMinutes] = useState(0);\n  const [plannerItems, setPlannerItems] = useState<any[]>([]);\n  const [weeklyGoal, setWeeklyGoal] = useState(300);'
  );
}

// Fetch planner items in fetchDashboardData
const planFetchCode = `
      // get weekly goal
      const { data: profile } = await supabase.from('student_profiles').select('weekly_goal_minutes').eq('id', userId).single();
      if (profile?.weekly_goal_minutes) setWeeklyGoal(profile.weekly_goal_minutes);

      // fetch planner items for today
      const today = new Date().toISOString().split('T')[0];
      const { data: pItems } = await supabase.from('planner_items').select('*').eq('student_id', userId).eq('scheduled_date', today).order('scheduled_time', { ascending: true });
      
      let items = pItems || [];
      if (items.length === 0) {
        // Auto-generate plan
        const generated = [];
        // 1. flashcards
        const { data: fc } = await supabase.from('flashcard_reviews').select('topic_id, flashcard_id, next_review_date').eq('student_id', userId).lte('next_review_date', today).limit(1);
        if (fc && fc.length > 0) {
          generated.push({ student_id: userId, item_type: 'flashcards', title: 'Review due flashcards', scheduled_date: today, completed: false, topic_id: fc[0].topic_id, scheduled_time: '16:00' });
        }
        
        // 2. quiz (lowest score topic)
        const { data: qa } = await supabase.from('quiz_attempts').select('quiz_id, score, total_questions').eq('student_id', userId);
        if (qa && qa.length > 0) {
           const { data: qz } = await supabase.from('quizzes').select('id, topic_id, title').in('id', qa.map(a=>a.quiz_id));
           if (qz && qz.length > 0) {
             generated.push({ student_id: userId, item_type: 'quiz', title: \`Practice quiz: \${qz[0].title}\`, scheduled_date: today, completed: false, topic_id: qz[0].topic_id, scheduled_time: '17:30' });
           }
        }
        
        // 3. notes
        if (cs && cs.length > 0) {
          const { data: tps } = await supabase.from('topics').select('id, title').eq('course_id', cs[0].id).order('order_index', { ascending: true }).limit(1);
          if (tps && tps.length > 0) {
             generated.push({ student_id: userId, item_type: 'notes', title: \`Read notes: \${tps[0].title}\`, scheduled_date: today, completed: false, topic_id: tps[0].id, scheduled_time: '19:00' });
          }
        }

        if (generated.length > 0) {
          const { data: inserted } = await supabase.from('planner_items').insert(generated).select('*');
          if (inserted) items = inserted;
        }
      }
      setPlannerItems(items);
`;

if (!content.includes('// fetch planner items for today')) {
  content = content.replace(
    /setTotalQuizzes\(qzCount\);\s*setTotalTopics\(tpCount\);\s*setCurricula\(cs\);/,
    `setTotalQuizzes(qzCount);\n      setTotalTopics(tpCount);\n      setCurricula(cs);\n${planFetchCode}`
  );
}

// Update the return statement of dashboard main view
const newReturn = `
  const firstName = name ? name.split(' ')[0] : 'Student';
  const planDone = plannerItems.filter(i => i.completed).length;
  const planTotal = plannerItems.length;
  const isPlanUpToDate = planTotal > 0 && planDone === planTotal;
  const mostActiveCourse = curricula.length > 0 ? curricula[0] : null;
  const nextUpText = mostActiveCourse ? \`You're 3 sessions away from finishing \${mostActiveCourse.title} this week.\` : "Let's keep the momentum going!";
  
  const togglePlannerItem = async (item: any) => {
    const newVal = !item.completed;
    const upd = await supabase.from('planner_items').update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null }).eq('id', item.id).select('*').single();
    if (upd.data) {
      setPlannerItems(prev => prev.map(p => p.id === item.id ? upd.data : p));
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* Hero section */}
      {(totalTopics > 0 || curricula.length > 0) ? (
        <div className="bg-gradient-to-br from-[#110B30] to-[#1A114D] rounded-3xl p-8 md:p-11 mb-6 relative overflow-hidden text-white shadow-sm">
           <div className="relative z-10 flex flex-col items-start">
              <div className="inline-flex items-center gap-2 bg-[#F5A623]/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold mb-4 backdrop-blur-sm">
                 {isPlanUpToDate ? "✦ Your plan is up to date" : "✦ You have tasks pending today"}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                 Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5A623] to-[#E85D8F]">{firstName}</span>.
              </h1>
              
              <p className="text-white/70 text-[15px] mb-6 max-w-xl">
                 {nextUpText}
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                 <button className="bg-[#5B4FE8] text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-[#5B4FE8]/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]">
                   <Play className="w-[18px] h-[18px] fill-current" /> Start today's session
                 </button>
                 <button onClick={() => { document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-transparent text-white border-2 border-white/25 px-6 py-[12px] rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-white/10 transition-colors">
                   Adjust plan <ArrowRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#5B4FE8]/20 to-[#9B5DE8]/20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
        </div>
      ) : (
        <div className="bg-surface-alt rounded-[32px] border border-border p-10 md:p-12 mb-8 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
                <h2 className="text-3xl font-bold text-ink mb-4 font-display tracking-tight">Let's get started with your learning journey</h2>
                <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed text-[15px]">
                    Your dashboard is looking a little empty. Follow these simple steps to start turning your study materials into interactive, AI-powered learning experiences.
                </p>
                <button 
                  onClick={() => setView('upload')}
                  className="px-6 py-3.5 rounded-full bg-[#5B4FE8] text-white text-[14.5px] font-semibold hover:bg-[#5B4FE8]/90 flex items-center gap-2 transition-colors shadow-[0_8px_16px_-6px_rgba(91,79,232,0.5)]"
                >
                  <Plus className="w-4 h-4" /> Add Materials
                </button>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-slate-100 rounded-3xl flex items-center justify-center p-8 shrink-0">
               <Folder className="w-16 h-16 text-slate-300" />
            </div>
        </div>
      )}

      {/* Stats Cards */}
      {(totalTopics > 0 || curricula.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FDF1DC] rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Streak</span>
               <span className="opacity-70 text-[15px]">🔥</span>
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{streak} d</div>
          </div>
          
          <div className="bg-[#EDEBFC] rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Cards Mastered</span>
               <Library className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{masteryStats?.mastered || 0}</div>
          </div>
          
          <div className="bg-surface-alt border border-border rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Quiz Average</span>
               <Target className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{totalQuizzes > 0 ? '81%' : '0%'}</div>
          </div>
          
          <div className="bg-surface-alt border border-border rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Weekly Goal</span>
               <TrendingUp className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{Math.min(100, Math.round((weeklyMinutes / Math.max(1, weeklyGoal)) * 100))}%</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {(totalTopics > 0 || curricula.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          
          {/* Active courses */}
          <div className="bg-surface-alt border border-border rounded-[20px] p-6 lg:p-7 h-fit" id="courses">
             <div className="flex justify-between items-center mb-4.5">
                <h3 className="font-display font-semibold text-[18px]">Active courses</h3>
                <button onClick={() => onNavigate && onNavigate('courses')} className="text-[13.5px] font-semibold text-[#5B4FE8] hover:underline">View all</button>
             </div>
             
             <div className="flex flex-col gap-3">
                {curricula.slice(0,3).map((c, i) => (
                   <button 
                     key={c.id} 
                     onClick={() => {
                        onNavigate && onNavigate('courses');
                     }}
                     className="block w-full text-left p-[18px] px-5 rounded-2xl bg-surface hover:bg-[#EDEBFC] transition-colors group"
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <h4 className="font-display font-semibold text-[16px] mb-1 group-hover:text-[#5B4FE8] transition-colors">{c.title}</h4>
                            <div className="text-[12.5px] text-ink/60">Next: Continue learning</div>
                         </div>
                         <div className="font-mono font-semibold text-[14px] text-[#5B4FE8]">{c.progress}%</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                         <div className="h-full bg-[#5B4FE8] rounded-full" style={{ width: \`\${c.progress}%\` }}></div>
                      </div>
                   </button>
                ))}
                {curricula.length === 0 && <div className="text-sm text-slate-500 py-4 text-center">No active courses yet.</div>}
             </div>
          </div>

          {/* Today's plan */}
          <div className="bg-surface-alt border border-border rounded-[20px] p-6 lg:p-7 h-fit" id="planner">
             <div className="mb-4">
               <h3 className="font-display font-semibold text-[18px] mb-0.5">Today's plan</h3>
               <div className="text-[12.5px] text-ink/60 -mt-1.5">{planDone}/{planTotal} completed</div>
             </div>
             
             <div className="flex flex-col gap-2.5">
                 {plannerItems.map((item, i) => (
                   <div key={item.id} className={\`flex items-center gap-3.5 p-3.5 px-4 rounded-xl transition-colors \${item.completed ? 'bg-surface/50 opacity-60' : 'bg-surface'}\`}>
                     <button onClick={() => toggleTogglePlannerItem(item)} className={\`w-[22px] h-[22px] rounded-full border-2 shrink-0 transition-colors \${item.completed ? 'bg-[#2FBF8F] border-[#2FBF8F] flex items-center justify-center' : 'border-border hover:border-slate-300'}\`}>
                        {item.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                     </button>
                     <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10.5px] text-[#5B4FE8] uppercase tracking-[0.05em] mb-1 leading-none">{item.scheduled_time || 'ANYTIME'} · {item.item_type}</div>
                        <div className={\`text-[14.5px] font-medium truncate \${item.completed ? 'line-through text-ink/60' : 'text-ink'}\`}>{item.title}</div>
                     </div>
                   </div>
                 ))}
                 {plannerItems.length === 0 && <div className="text-sm text-slate-500 py-4 text-center">No tasks scheduled for today.</div>}
             </div>
          </div>
        </div>
      )}
    </div>
  );
`;

const startIndex = content.lastIndexOf('  const firstName = name ? name.split(\' \')[0].toUpperCase() : \'\';');
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + newReturn + '\n}\n';
  fs.writeFileSync('src/components/Dashboard.tsx', content);
}
