import { GlobalUploadFlow } from './GlobalUploadFlow';
import { CurriculumResults } from './CurriculumResults';
import { SemesterDetail } from './SemesterDetail';
import CourseDetail from './CourseDetail';
import { GoalDetail } from './GoalDetail';
import MyCourses from './MyCourses';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Planner } from './Planner';
import { Dashboard } from './Dashboard';
import { BadgeToast } from './BadgeToast';
import { FlashcardReviewer } from './FlashcardReviewer';
import { MyCurricula } from './MyCurricula';
import { MySemesters } from './MySemesters';
import { MyGoals } from './MyGoals';
import { Progress } from './Progress';
import { Profile } from './Profile';
import { LayoutGrid, Settings, LogOut, Calendar, BookOpen, Activity, Menu, X } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsBell } from './NotificationsBell';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';
import { localDateStr, addDays } from '../lib/dates';

interface MainAppProps {
  name: string;
  avatarUrl?: string;
  userId: string;
  onLogout: () => void;
}

function SidebarItem({ active, icon, label, onClick }: any) {
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
}


export const NavigationContext = React.createContext<{
  dashboardView: 'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail' | 'goalDetail';
  setDashboardView: (v: any) => void;
  setCurrentView: (v: any) => void;
  dashboardCurriculumId: string | null;
  setDashboardCurriculumId: (id: string | null) => void;
  dashboardSemesterId: string | null;
  setDashboardSemesterId: (id: string | null) => void;
  dashboardGoalId: string | null;
  setDashboardGoalId: (id: string | null) => void;
  dashboardCourseId: string | null;
  setDashboardCourseId: (id: string | null) => void;
  dashboardTopicId: string | undefined;
  setDashboardTopicId: (id: string | undefined) => void;
} | null>(null);

export function useNavigationStore() {
  const ctx = React.useContext(NavigationContext);
  if (!ctx) throw new Error('Missing NavigationContext');
  return ctx;
}

export function MainApp({ name, avatarUrl, userId, onLogout }: MainAppProps) {
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const avatarRef = React.useRef<HTMLDivElement>(null);

  // Close the account menu on outside click or Escape
  useEffect(() => {
    if (!showAvatarMenu) return;
    const onDown = (e: MouseEvent) => { if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setShowAvatarMenu(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowAvatarMenu(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [showAvatarMenu]);
  const [currentView, setCurrentViewRaw] = useState<'dashboard' | 'courses' | 'flashcards' | 'quizzes' | 'planner' | 'curricula' | 'progress' | 'profile'>('dashboard');
  const [track, setTrack] = useState('secondary');
  const [streakDays, setStreakDays] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);
  const [dashboardView, setDashboardView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail' | 'goalDetail'>('loading');
  const [dashboardCurriculumId, setDashboardCurriculumId] = useState<string | null>(null);
  const [dashboardSemesterId, setDashboardSemesterId] = useState<string | null>(null);
  const [dashboardGoalId, setDashboardGoalId] = useState<string | null>(null);
  const [dashboardCourseId, setDashboardCourseId] = useState<string | null>(null);
  const [dashboardTopicId, setDashboardTopicId] = useState<string | undefined>(undefined);

  // Changing screens closes the phone menu and scrolls to the top
  const setCurrentView = (v: any) => {
    setCurrentViewRaw(v);
    setMobileNavOpen(false);
    setShowAvatarMenu(false);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    async function loadData() {
      const [profileRes, streaksRes] = await Promise.all([
        supabase.from('student_profiles').select('track').eq('id', userId).maybeSingle(),
        supabase.from('streaks').select('current_streak, last_active_date').eq('student_id', userId).maybeSingle(),
      ]);
      if (profileRes.data?.track) setTrack(profileRes.data.track);

      // A streak only counts if they studied today or yesterday
      const lastActive = streaksRes.data?.last_active_date || '';
      const today = localDateStr();
      const yesterday = localDateStr(addDays(new Date(), -1));
      setStreakDays(lastActive >= yesterday ? (streaksRes.data?.current_streak || 0) : 0);
      setStudiedToday(lastActive === today);
    }
    loadData();
  }, [userId, currentView]); // refresh the streak when moving between screens

  // Course pages live inside the Overview screen; highlight "Courses" while one is open
  const inCourse = ['courseDetail', 'curriculum', 'semesterDetail', 'goalDetail'].includes(dashboardView);
  const initials = name ? name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase() : 'U';

  const navItems = (
    <>
      <SidebarItem active={currentView === 'dashboard' && !inCourse} icon={<LayoutGrid className="w-[18px] h-[18px]" />} label="Overview" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
      <SidebarItem active={currentView === 'courses' || (currentView === 'dashboard' && inCourse)} icon={<BookOpen className="w-[18px] h-[18px]" />} label="Courses" onClick={() => setCurrentView('courses')} />
      <SidebarItem active={currentView === 'progress'} icon={<Activity className="w-[18px] h-[18px]" />} label="Progress" onClick={() => setCurrentView('progress')} />
      <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('planner')} />
      <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" onClick={() => setCurrentView('profile')} />
      <div className="mt-auto"></div>
      <SidebarItem active={false} icon={<LogOut className="w-[18px] h-[18px]" />} label="Log Out" onClick={onLogout} />
    </>
  );

  const streakCard = (
    <div className="bg-white/5 border border-white/5 rounded-tl-[24px] rounded-tr-[24px] rounded-bl-lg rounded-br-[24px] p-5 backdrop-blur-md">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#F5A623] mb-1.5">Streak</div>
      <div className="font-display font-extrabold text-[22px] tracking-tight mb-0.5">{streakDays} {streakDays === 1 ? 'day' : 'days'} <span className="opacity-90">🔥</span></div>
      <div className={cn("text-[12px] font-medium", streakDays > 0 && !studiedToday ? "text-[#F5A623]" : "text-white/50")}>
        {streakDays === 0
          ? 'Study today to start a streak.'
          : studiedToday
            ? 'Safe for today. See you tomorrow.'
            : `Study today or lose your ${streakDays}-day streak.`}
      </div>
    </div>
  );

  // No display utility here: tailwind-merge would let "flex" override "hidden" on phones
  const sidebarClasses = "bg-gradient-to-b from-[#1E1139] via-[#160A2D] to-[#0E061E] text-white flex-col p-5 md:p-6";
  const logo = (
    <div className="flex items-center gap-3 px-2 font-bold text-xl font-display tracking-tight">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C6FF0] to-[#5B4FE8]"></div>
      uJuzi
    </div>
  );

  return (
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
      {/* Sidebar (laptop and tablet) */}
      <aside className={cn("hidden lg:flex w-[260px] shrink-0 h-screen sticky top-0 shadow-2xl z-50", sidebarClasses)} aria-label="Main navigation">
        <div className="pb-10">{logo}</div>
        <nav className="flex flex-col gap-2 flex-1 px-1">{navItems}</nav>
        <div className="mt-6 px-1">{streakCard}</div>
      </aside>

      {/* Slide-in menu (phones) */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={() => setMobileNavOpen(false)} />
          <aside className={cn("flex absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] overflow-y-auto shadow-2xl animate-in fade-in", sidebarClasses)}>
            <div className="flex items-center justify-between pb-8">
              {logo}
              <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-2 flex-1 px-1">{navItems}</nav>
            <div className="mt-6 px-1">{streakCard}</div>
          </aside>
        </div>
      )}

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-[72px] lg:h-[96px] px-4 md:px-8 lg:px-10 flex items-center gap-3 md:gap-5 sticky top-0 z-40 bg-white border-b border-slate-100 lg:border-none">
           <button
             onClick={() => setMobileNavOpen(true)}
             aria-label="Open menu"
             className="lg:hidden w-[44px] h-[44px] rounded-full bg-[#F8F9FA] border border-slate-100 flex items-center justify-center text-ink shrink-0"
           >
             <Menu className="w-5 h-5" />
           </button>
           <div className="flex-1 min-w-0 flex justify-center">
             <div className="w-full max-w-[1240px]">
               <GlobalSearch userId={userId} />
             </div>
           </div>

           <NotificationsBell key={currentView} userId={userId} streakAtRisk={streakDays > 0 && !studiedToday} streakDays={streakDays} />

           <div ref={avatarRef} className="relative shrink-0">
             <button
                className="w-[44px] h-[44px] rounded-full bg-[#6C5CE7] flex items-center justify-center text-white font-bold text-[14px] cursor-pointer shadow-sm hover:opacity-90 transition-opacity overflow-hidden"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                aria-label="Account menu"
             >
               {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : initials}
             </button>
             
             {showAvatarMenu && (
                <>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-40 flex flex-col overflow-hidden animate-in fade-in">
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
        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-[1240px] w-full mx-auto">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
          {currentView === 'courses' && <MyCourses userId={userId} onNavigate={setCurrentView} />}
          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
          {currentView === 'progress' && <Progress userId={userId} />}
          {currentView === 'planner' && <Planner userId={userId} />}
          {currentView === 'profile' && <Profile userId={userId} />}
        </main>
      </div>
    </div>
      <BadgeToast />
    </NavigationContext.Provider>
  );
}
