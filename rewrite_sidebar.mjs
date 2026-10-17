import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

const oldSidebarStart = `function SidebarItem({ active, icon, label, onClick }: any) {`;
const oldSidebarEnd = `      {/* Main Right Area */}`;

const targetSection = content.substring(content.indexOf(oldSidebarStart), content.indexOf(oldSidebarEnd));

const newSidebarSection = `function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-[16px] text-[14.5px] font-bold transition-all w-full text-left relative",
        active 
          ? "bg-white text-[#110B29]" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn("flex items-center justify-center", active ? "text-[#110B29]" : "text-white/60")}>
         {icon}
      </div>
      {label}
      {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#F5A623]"></div>}
    </button>
  );
}

// Ensure icons are imported if not already. We'll assume lucide-react is mostly imported.
// The sidebar has a very specific gradient in the screenshot.

// (Replacing the Left Sidebar div in MainApp.tsx's return statement)
`;

// It's better to just use replace for specific blocks.

const sidebarJSXStart = `{/* Left Sidebar */}`;
const sidebarJSXEnd = `{/* Main Right Area */}`;
const oldSidebarJSX = content.substring(content.indexOf(sidebarJSXStart), content.indexOf(sidebarJSXEnd));

const newSidebarJSX = `{/* Left Sidebar */}
      <div className="w-[260px] shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[#1E1139] via-[#160A2D] to-[#0E061E] text-white flex flex-col p-5 md:p-6 shadow-2xl z-50">
        <div className="flex items-center gap-3 px-2 pb-10 font-bold text-xl font-display tracking-tight">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C6FF0] to-[#5B4FE8] flex items-center justify-center font-bold text-[14px]">uJ</div>
           uJuzi
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 px-1">
           <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-[18px] h-[18px]" />} label="Overview" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
           <SidebarItem active={currentView === 'courses'} icon={<BookOpen className="w-[18px] h-[18px]" />} label="Courses" onClick={() => setCurrentView('courses')} />
           <SidebarItem active={currentView === 'flashcards'} icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M12 2v20"/></svg>} label="Flashcards" onClick={() => setCurrentView('flashcards')} />
           <SidebarItem active={currentView === 'quizzes'} icon={<svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>} label="Quizzes" onClick={() => setCurrentView('quizzes')} />
           <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('planner')} />
           <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" onClick={() => setCurrentView('profile')} />
        </nav>
        
        <div className="mt-auto px-1">
           <div className="bg-white/5 border border-white/5 rounded-tl-[24px] rounded-tr-[24px] rounded-bl-lg rounded-br-[24px] p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#F5A623] mb-1.5">Streak</div>
              <div className="font-display font-extrabold text-[22px] tracking-tight mb-0.5">{streakDays} days <span className="opacity-90">🔥</span></div>
              <div className="text-[12px] text-white/50 font-medium">Keep it alive — 20 min today.</div>
           </div>
        </div>
      </div>
      `;

content = content.replace(oldSidebarJSX, newSidebarJSX);

// Also need to replace the SidebarItem component
const oldSidebarItemCompStart = `function SidebarItem({ active, icon, label, onClick }: any) {`;
const oldSidebarItemCompEnd = `    </button>
  );
}`;

const oldSidebarItemComp = content.substring(content.indexOf(oldSidebarItemCompStart), content.indexOf(oldSidebarItemCompEnd) + oldSidebarItemCompEnd.length);

const newSidebarItemComp = `function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3.5 px-4 py-3.5 rounded-[16px] text-[14px] font-bold transition-all w-full text-left relative",
        active 
          ? "bg-white text-[#110B29] shadow-sm" 
          : "text-white/60 hover:bg-white/5 hover:text-white"
      )}
    >
      <div className={cn("flex items-center justify-center", active ? "text-[#110B29]" : "text-white/60")}>
         {icon}
      </div>
      {label}
      {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#F5A623]"></div>}
    </button>
  );
}`;

content = content.replace(oldSidebarItemComp, newSidebarItemComp);

fs.writeFileSync('src/components/MainApp.tsx', content);

