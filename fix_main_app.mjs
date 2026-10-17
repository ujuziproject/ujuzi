import fs from 'fs';

let content = fs.readFileSync('src/components/MainApp.tsx', 'utf-8');

// 1. Add avatar dropdown state
const mainAppDef = "export function MainApp({ name, avatarUrl, userId, onLogout }: MainAppProps) {";
content = content.replace(mainAppDef, mainAppDef + "\n  const [showAvatarMenu, setShowAvatarMenu] = useState(false);");

// 2. Fix Left Sidebar
const sidebarStartRegex = /\{\/\*\s*Left Sidebar\s*\*\/\}/;
const sidebarEndRegex = /\{\/\*\s*Main Right Area\s*\*\/\}/;
const sidebarStartIndex = content.search(sidebarStartRegex);
const sidebarEndIndex = content.search(sidebarEndRegex);

const newSidebar = `{/* Left Sidebar */}
      <div className="w-[260px] shrink-0 h-screen sticky top-0 bg-gradient-to-b from-[#1E1139] via-[#160A2D] to-[#0E061E] text-white flex flex-col p-5 md:p-6 shadow-2xl z-50">
        <div className="flex items-center gap-3 px-2 pb-10 font-bold text-xl font-display tracking-tight">
           <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C6FF0] to-[#5B4FE8] flex items-center justify-center font-bold text-[14px]"></div>
           uJuzi
        </div>
        
        <nav className="flex flex-col gap-2 flex-1 px-1">
           <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-[18px] h-[18px]" />} label="Overview" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
           <SidebarItem active={currentView === 'courses'} icon={<BookOpen className="w-[18px] h-[18px]" />} label="Courses" onClick={() => setCurrentView('courses')} />
           <SidebarItem active={currentView === 'progress'} icon={<Activity className="w-[18px] h-[18px]" />} label="Progress" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('planner')} />
           <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" onClick={() => setCurrentView('profile')} />
           
           <div className="mt-auto"></div>
           <SidebarItem active={false} icon={<LogOut className="w-[18px] h-[18px]" />} label="Log Out" onClick={onLogout} />
        </nav>
        
        <div className="mt-6 px-1">
           <div className="bg-white/5 border border-white/5 rounded-tl-[24px] rounded-tr-[24px] rounded-bl-lg rounded-br-[24px] p-5 backdrop-blur-md">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#F5A623] mb-1.5">Streak</div>
              <div className="font-display font-extrabold text-[22px] tracking-tight mb-0.5">{streakDays} days <span className="opacity-90">🔥</span></div>
              <div className="text-[12px] text-white/50 font-medium">Keep it alive — 20 min today.</div>
           </div>
        </div>
      </div>
      `;
      
content = content.substring(0, sidebarStartIndex) + newSidebar + content.substring(sidebarEndIndex);

// 3. Fix Top Header
const headerStartRegex = /\{\/\*\s*Top Header\s*\*\/\}/;
const headerEndRegex = /\{\/\*\s*Content Area\s*\*\/\}/;
const headerStartIndex = content.search(headerStartRegex);
const headerEndIndex = content.search(headerEndRegex);

const newHeader = `{/* Top Header */}
        <header className="h-[96px] px-8 md:px-10 flex items-center gap-5 sticky top-0 z-40 bg-white">
           <div className="flex-1 max-w-[800px] flex items-center gap-3 bg-[#F8F9FA] rounded-[18px] px-5 py-3.5 text-slate-400 text-[15px] font-medium border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
              <Search className="w-[18px] h-[18px] text-slate-400" /> 
              <input type="text" placeholder="Search topics, courses, flashcards..." className="bg-transparent border-none outline-none flex-1 placeholder:text-slate-400 text-ink" />
              <div className="ml-auto font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-sm">⌘K</div>
           </div>
           
           <div className="flex-1"></div>
           
           <button className="w-[44px] h-[44px] rounded-full bg-[#F8F9FA] border border-slate-100 flex items-center justify-center text-slate-500 relative cursor-pointer hover:bg-slate-100 transition-colors">
             <Bell className="w-5 h-5" />
             <span className="absolute top-[11px] right-[11px] w-2 h-2 bg-[#F5A623] rounded-full border-2 border-white"></span>
           </button>
           
           <div className="relative">
             <div 
                className="w-[44px] h-[44px] rounded-full bg-[#6C5CE7] flex items-center justify-center text-white font-bold text-[14px] cursor-pointer shadow-sm hover:opacity-90 transition-opacity"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
             >
               {name ? name.substring(0, 2).toUpperCase() : 'A0'}
             </div>
             
             {showAvatarMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowAvatarMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <button 
                      className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 w-full text-left transition-colors"
                      onClick={() => { setShowAvatarMenu(false); setCurrentView('profile'); }}
                    >
                      <Settings className="w-[16px] h-[16px]" />
                      Settings
                    </button>
                    <div className="h-px bg-slate-100 w-full my-1"></div>
                    <button 
                      className="flex items-center gap-3 px-4 py-3 text-[14px] font-medium text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      onClick={() => { setShowAvatarMenu(false); onLogout(); }}
                    >
                      <LogOut className="w-[16px] h-[16px]" />
                      Log Out
                    </button>
                  </div>
                </>
             )}
           </div>
        </header>
        `;
        
content = content.substring(0, headerStartIndex) + newHeader + content.substring(headerEndIndex);

fs.writeFileSync('src/components/MainApp.tsx', content);
