import fs from 'fs';

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// Find where togglePlannerItem ends
const marker = "    }\n  };\n";
const markerIndex = content.lastIndexOf("togglePlannerItem");

if (markerIndex !== -1) {
    const startOfReturn = content.indexOf("  return (", markerIndex);
    if (startOfReturn !== -1) {
        // Keep everything before the actual main return of the Dashboard component
        const contentBefore = content.substring(0, startOfReturn);
        
        const newJSX = `  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Top Toggle */}
      <div className="flex justify-end mb-6">
         <div className="bg-[#F4F4F6] rounded-full p-1 flex">
            <button className="bg-[#110B29] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-sm">NEW LEARNER</button>
            <button className="text-slate-400 text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full hover:text-slate-600">ACTIVE LEARNER</button>
         </div>
      </div>

      {/* Hero section */}
      <div className="bg-gradient-to-r from-[#1E1538] via-[#2F1B54] to-[#45206C] rounded-[32px] p-10 md:p-14 mb-10 relative overflow-hidden text-white shadow-sm flex justify-between items-center">
         <div className="relative z-10 flex flex-col items-start max-w-[500px]">
            <div className="mb-6 bg-white/5 border border-white/10 text-[#E8A55B] px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide backdrop-blur-sm flex items-center gap-2">
               <span>🚀</span> Your syllabus, decoded
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white leading-tight font-display">
               Welcome to uJuzi,<br />
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F2994A] to-[#E79796]">
                  {firstName}.
               </span>
            </h1>
            
            <p className="text-white/70 text-[15.5px] mb-10 leading-relaxed">
               You're 2 steps from your first AI-built study pack. Finish setup and we'll turn your syllabus into notes, cards and quizzes.
            </p>
            
            <div className="w-full mb-8">
               <div className="flex justify-between text-[10px] font-bold tracking-widest text-white/50 mb-3 uppercase">
                  <span>Level 1 · Starter</span>
                  <span>120/260 XP</span>
               </div>
               <div className="h-2.5 rounded-full bg-white/10 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-[#6C5CE7] rounded-full" style={{ width: '67%' }}></div>
               </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                 <button 
                  onClick={() => setView('upload')}
                  className="bg-[#6C5CE7] text-white px-7 py-3.5 rounded-full font-bold text-[14.5px] flex items-center gap-2 hover:bg-[#5B4FE8] transition-colors"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                   Add your first course <ArrowRight className="w-4 h-4" />
                 </button>
                 <button className="bg-transparent text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14.5px] hover:bg-white/10 transition-colors">
                   Take a 60-second tour
                 </button>
            </div>
         </div>
         
         <div className="relative z-10 hidden md:flex items-center justify-center mr-8">
            <div className="w-48 h-48 rounded-[36px] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
               <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F5A623" strokeWidth="3" strokeDasharray="100" strokeDashoffset={33} strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white tracking-tight">67%</span>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase mt-1">Set up</span>
               </div>
               <div className="absolute bottom-4 text-[10px] font-bold tracking-widest text-[#F5A623] uppercase">
                 4 of 6 steps
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-10 mb-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100/60">
         <div className="flex justify-between items-end mb-6">
            <div>
               <h3 className="font-display font-extrabold text-[24px] text-[#110B29] tracking-tight">Your launch quests</h3>
               <p className="text-slate-500 text-[14.5px] mt-1 font-medium">Tick them off — each one sharpens what uJuzi builds for you.</p>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-[#6C5CE7] bg-[#E2F7EB] px-3 py-1 rounded-md uppercase">4/6 Complete</div>
         </div>
         
         <div className="flex flex-col gap-0">
            <ChecklistItem title="Create your account" subText="Welcome aboard" xp={20} complete={true} />
            <ChecklistItem title="Complete your academic profile" subText="So we match your level" xp={30} complete={true} />
            <ChecklistItem title="Take the learning style quiz" subText="Visual? Practice-first?" xp={40} complete={true} />
            
            <ChecklistItem 
              title="Add your first course" 
              subText="Drop in a syllabus or outline" 
              xp={60} 
              complete={false} 
              actionText="Add materials" 
              onAction={() => setView('upload')}
              icon={(props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
            />
            
            <ChecklistItem 
              title="Generate your first study materials" 
              subText="Notes, flashcards & quizzes in one tap" 
              xp={80} 
              complete={false} 
              actionText="Generate"
              darkButton={true}
              icon={(props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/></svg>}
            />
         </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFF6D9] rounded-[24px] p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#A5824C]">Streak</span>
             <span className="opacity-70 text-[15px]">🔥</span>
          </div>
          <div className="font-display font-extrabold text-[36px] tracking-tight text-[#110B29] leading-none mb-2">{streak > 0 ? \`\${streak} d\` : '1 d'}</div>
          <span className="text-[13px] text-[#A5824C] font-medium leading-tight">{streak === 0 ? 'Day one — keep it alive' : 'Keep it going!'}</span>
        </div>
        
        <div className="bg-[#EAE4FF] rounded-[24px] p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
             <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#695D94]">Cards Mastered</span>
             <Library className="w-[15px] h-[15px] opacity-70 text-[#695D94]" />
          </div>
          <div className="font-display font-extrabold text-[36px] tracking-tight text-[#110B29] leading-none mb-2">{cardsMastered || 0}</div>
          <span className="text-[13px] text-[#695D94] font-medium leading-tight">{cardsMastered === 0 ? 'Your first deck awaits' : 'Great job!'}</span>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">Quiz Average</span>
             <Target className="w-[15px] h-[15px] opacity-70 text-slate-400" />
          </div>
          <div className="font-display font-extrabold text-[36px] tracking-tight text-[#110B29] leading-none mb-2">{quizAverage > 0 ? \`\${quizAverage}%\` : '0%'}</div>
          <span className="text-[13px] text-slate-400 font-medium leading-tight">{quizAverage === 0 ? 'No quizzes yet' : 'Keep practicing'}</span>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-[24px] p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-4">
             <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-slate-400">Weekly Goal</span>
             <TrendingUp className="w-[15px] h-[15px] opacity-70 text-slate-400" />
          </div>
          <div className="font-display font-extrabold text-[36px] tracking-tight text-[#110B29] leading-none mb-2">{Math.min(100, Math.round((weeklyMinutes / Math.max(1, weeklyGoal)) * 100))}%</div>
          <span className="text-[13px] text-slate-400 font-medium leading-tight">{weeklyMinutes === 0 ? "Let's get moving" : 'On track!'}</span>
        </div>
      </div>
      
      {/* What unlocks next */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100/60">
         <h3 className="font-display font-extrabold text-[24px] text-[#110B29] tracking-tight mb-6">What unlocks next</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-[#EAE4FF] rounded-[24px] p-6 shadow-sm border border-[#EAE4FF]/50">
               <div className="w-12 h-12 bg-[#110B29] rounded-full flex items-center justify-center mb-5 text-white shadow-md">
                  <BookOpen className="w-5 h-5" />
               </div>
               <h4 className="font-bold text-[17px] text-[#110B29] mb-3">Syllabus → study plan</h4>
               <p className="text-[#695D94] text-[14.5px] font-medium leading-relaxed">Drop your WAEC, JAMB or course outline. We map every topic to a session.</p>
            </div>
            
            <div className="bg-[#FFF6D9] rounded-[24px] p-6 shadow-sm border border-[#FFF6D9]/50">
               <div className="w-12 h-12 bg-[#110B29] rounded-full flex items-center justify-center mb-5 text-white shadow-md">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M12 2v20"/></svg>
               </div>
               <h4 className="font-bold text-[17px] text-[#110B29] mb-3">Flashcards that adapt</h4>
               <p className="text-[#A5824C] text-[14.5px] font-medium leading-relaxed">Cards resurface exactly when you're about to forget them.</p>
            </div>
            
            <div className="bg-[#B9E9CD] rounded-[24px] p-6 shadow-sm border border-[#B9E9CD]/50">
               <div className="w-12 h-12 bg-[#110B29] rounded-full flex items-center justify-center mb-5 text-white shadow-md">
                  <Target className="w-5 h-5" />
               </div>
               <h4 className="font-bold text-[17px] text-[#110B29] mb-3">Exam-shaped quizzes</h4>
               <p className="text-[#4E8D6B] text-[14.5px] font-medium leading-relaxed">Questions written in the style you'll actually be tested on.</p>
            </div>
         </div>
      </div>

    </div>
  );
}
`;
        fs.writeFileSync('src/components/Dashboard.tsx', contentBefore + newJSX);
    }
}
