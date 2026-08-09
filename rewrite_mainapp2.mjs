import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

// 1. Add streakDays state if not there
if (!content.includes("const [streakDays, setStreakDays] = useState(0);")) {
  content = content.replace(
    "const [dashboardView, setDashboardView] = useState",
    "const [streakDays, setStreakDays] = useState(0);\n  const [dashboardView, setDashboardView] = useState"
  );
}

// 2. Set streakDays inside loadData
if (!content.includes("setStreakDays(streakDays);")) {
  content = content.replace(
    "const streakDays = streaksRes.data?.current_streak || 0;",
    "const streakDays = streaksRes.data?.current_streak || 0;\n      setStreakDays(streakDays);"
  );
}

// 3. Update SidebarItem
content = content.replace(
  /function SidebarItem\({ active, icon, label, onClick }: any\) {[\s\S]*?return \([\s\S]*?className=\{cn\([\s\S]*?\)\}[\s\S]*?>[\s\S]*?<\/button>[\s\S]*?\);[\s\S]*?\}/,
  `function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-all w-full text-left relative",
        active 
          ? "bg-white text-ink font-semibold" 
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className={active ? "text-ink" : "text-white/70"}>{icon}</span>
      {label}
      {active && <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>}
    </button>
  );
}`
);

// 4. Update the layout in return()
const newLayout = `  return (
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
          {currentView === 'courses' && <MyCourses userId={userId} />}
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

content = content.replace(/  return \([\s\S]*?<\div className="flex flex-col min-h-screen bg-surface font-sans text-ink">[\s\S]*?<\/NavigationContext\.Provider>\n  \);/g, newLayout);

fs.writeFileSync('src/components/MainApp.tsx', content);
