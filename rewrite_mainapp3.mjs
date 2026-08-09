import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

const returnIndex = content.lastIndexOf('  return (');
if (returnIndex !== -1) {
  content = content.substring(0, returnIndex) + `  return (
    <NavigationContext.Provider value={{
      dashboardView, setDashboardView,
      setCurrentView,
      dashboardCurriculumId, setDashboardCurriculumId,
      dashboardSemesterId, setDashboardSemesterId,
      dashboardGoalId, setDashboardGoalId,
      dashboardCourseId, setDashboardCourseId,
      dashboardTopicId, setDashboardTopicId
    }}>
    <div className="flex min-h-screen bg-surface font-sans text-ink">
      {/* Left Sidebar */}
      <div className="w-[236px] shrink-0 h-screen sticky top-0 bg-ink text-white flex flex-col p-4 md:p-6">
        <div className="flex items-center gap-2.5 px-2.5 pb-7 font-bold text-lg font-display">
           <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#5B4FE8] to-[#7C6FF0] flex items-center justify-center font-bold text-[13px]">uJ</div>
           uJuzi
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
           <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-[18px] h-[18px]" />} label="Overview" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
           <SidebarItem active={currentView === 'courses'} icon={<BookOpen className="w-[18px] h-[18px]" />} label="Courses" onClick={() => setCurrentView('courses')} />
           <SidebarItem active={currentView === 'flashcards'} icon={<Library className="w-[18px] h-[18px]" />} label="Flashcards" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'quizzes'} icon={<CheckSquare className="w-[18px] h-[18px]" />} label="Quizzes" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" onClick={() => setCurrentView('profile')} />
        </nav>
        
        <div className="bg-[#FDF1DC] rounded-2xl p-4 mt-4 text-ink">
           <div className="font-mono text-[10px] uppercase tracking-widest text-ink/55 mb-1.5">Streak</div>
           <div className="font-display font-bold text-lg">🔥 {streakDays} days</div>
           <div className="text-xs text-ink/60 mt-1">Keep it alive — 20 min today.</div>
        </div>
      </div>

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-[76px] px-8 flex items-center gap-4 sticky top-0 z-10 bg-surface-alt border-b border-border">
           <div className="flex-1 max-w-[520px] flex items-center gap-2.5 bg-surface border border-border rounded-xl px-4 py-2.5 text-slate-500 text-sm">
              <Search className="w-4 h-4" /> Search topics, courses, flashcards... 
              <div className="ml-auto font-mono text-[11px] bg-surface-alt border border-border rounded-md px-1.5 py-0.5">⌘K</div>
           </div>
           
           <div className="flex-1"></div>
           
           <button className="w-10 h-10 rounded-full border border-border bg-surface-alt flex items-center justify-center text-slate-600 relative cursor-pointer">
             <Bell className="w-[18px] h-[18px]" />
             <span className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-[#F5A623] rounded-full"></span>
           </button>
           
           <button onClick={() => setCurrentView('profile')} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#7C6FF0] text-white flex items-center justify-center font-semibold text-[13px] cursor-pointer">
             {name ? name.charAt(0).toUpperCase() : 'U'}
           </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 max-w-[1240px] w-full">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
          {currentView === 'courses' && <MyCourses userId={userId} onNavigate={setCurrentView} />}
          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
          {currentView === 'progress' && <Progress userId={userId} />}
          {currentView === 'profile' && <Profile userId={userId} />}
        </main>
      </div>
    </div>
    </NavigationContext.Provider>
  );
}
`;
  fs.writeFileSync('src/components/MainApp.tsx', content);
}
