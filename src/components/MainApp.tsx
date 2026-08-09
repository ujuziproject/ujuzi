import MyCourses from './MyCourses';
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Dashboard } from './Dashboard';
import { FlashcardReviewer } from './FlashcardReviewer';
import { MyCurricula } from './MyCurricula';
import { MySemesters } from './MySemesters';
import { MyGoals } from './MyGoals';
import { Progress } from './Progress';
import { Profile } from './Profile';
import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun, Search, Bell, Library, CheckSquare, Calendar, BookOpen, Activity } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

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
        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-all w-full text-left relative",
        active 
          ? "bg-white dark:bg-accent text-ink dark:text-white font-semibold" 
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <span className={active ? "" : "opacity-70"}>{icon}</span>
      {label}
      {active && <span className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-[#F5A623]"></span>}
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
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'flashcards' | 'quizzes' | 'planner' | 'curricula' | 'progress' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
  const [learnerBadge, setLearnerBadge] = useState('Fresh Start');
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('secondary');
  const [streakDays, setStreakDays] = useState(0);
  const [dashboardView, setDashboardView] = useState<'loading' | 'home' | 'upload' | 'curriculum' | 'semesterDetail' | 'courseDetail' | 'goalDetail'>('loading');
  const [dashboardCurriculumId, setDashboardCurriculumId] = useState<string | null>(null);
  const [dashboardSemesterId, setDashboardSemesterId] = useState<string | null>(null);
  const [dashboardGoalId, setDashboardGoalId] = useState<string | null>(null);
  const [dashboardCourseId, setDashboardCourseId] = useState<string | null>(null);
  const [dashboardTopicId, setDashboardTopicId] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function loadData() {
      const [profileRes, streaksRes, quizRes, flashcardRes, interestRes, currRes] = await Promise.all([
        supabase.from('student_profiles').select('track').eq('id', userId).maybeSingle(),
        supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle(),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('flashcard_reviews').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('student_interests').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('curricula').select('*', { count: 'exact', head: true }).eq('student_id', userId)
      ]);
      
      if (profileRes.data?.track) setTrack(profileRes.data.track);

      const streakDays = streaksRes.data?.current_streak || 0;
      setStreakDays(streakDays);
      const quizzes = quizRes.count || 0;
      const flashcards = flashcardRes.count || 0;
      const interests = interestRes.count || 0;
      const curricula = currRes.count || 0;

      if (streakDays >= 3) {
        setAiInsight(`You're on a ${streakDays}-day streak! Keep up the great work.`);
      } else if (quizzes > 0) {
        const { data: allAttempts } = await supabase.from('quiz_attempts').select('quiz_id, score, total_questions').eq('student_id', userId);
        let weakestTopicStr = 'Review your weakest topics';
        if (allAttempts && allAttempts.length > 0) {
           const { data: quizzesList } = await supabase.from('quizzes').select('id, topic_id').in('id', allAttempts.map(a => a.quiz_id));
           if (quizzesList && quizzesList.length > 0) {
             const { data: topicsList } = await supabase.from('topics').select('id, title').in('id', quizzesList.map(q => q.topic_id));
             if (topicsList && topicsList.length > 0) {
                // Find weakest
                const topicScores: Record<string, {score: number, max: number}> = {};
                allAttempts.forEach(a => {
                   const q = quizzesList.find(qz => qz.id === a.quiz_id);
                   if (q) {
                     if (!topicScores[q.topic_id]) topicScores[q.topic_id] = {score: 0, max: 0};
                     topicScores[q.topic_id].score += a.score;
                     topicScores[q.topic_id].max += a.total_questions;
                   }
                });
                let weakestId = null;
                let lowestScore = 2; // 200%
                for (const tId in topicScores) {
                  const percent = topicScores[tId].score / Math.max(topicScores[tId].max, 1);
                  if (percent < lowestScore) {
                    lowestScore = percent;
                    weakestId = tId;
                  }
                }
                const weakestTopic = topicsList.find(t => t.id === weakestId);
                if (weakestTopic) {
                  weakestTopicStr = `Review '${weakestTopic.title}' — your lowest quiz score so far`;
                }
             }
           }
        }
        const quizText = quizzes === 1 ? '1 quiz' : `${quizzes} quizzes`;
        setAiInsight(`You've taken ${quizText}. ${weakestTopicStr}.`);
      } else if (flashcards > 0) {
        setAiInsight(`You've reviewed ${flashcards} flashcards. Staying on top of your spaced repetition is key!`);
      } else if (curricula > 0) {
        const curriculaText = curricula === 1 ? '1 curriculum' : `${curricula} curricula`;
        setAiInsight(`You have ${curriculaText} uploaded. Dive in and start generating materials to build your knowledge!`);
      } else {
        setAiInsight('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
      }

      if (streakDays >= 3) {
        setLearnerBadge('Consistency Champion');
      } else if (interests >= 5) {
        setLearnerBadge('Curious Explorer');
      } else if (flashcards > quizzes * 2 && flashcards > 0) {
        setLearnerBadge('Diligent Reviewer');
      } else if (quizzes > 2) {
        setLearnerBadge('Quick Thinker');
      } else {
        setLearnerBadge('Fresh Start');
      }

      setLoading(false);
    }
    loadData();
  }, [userId]);

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
      {/* Left Sidebar */}
      <div className="w-[236px] shrink-0 h-screen sticky top-0 bg-ink dark:bg-surface-alt text-white flex flex-col p-4 md:p-6">
        <div className="flex items-center gap-2.5 px-2.5 pb-7 font-bold text-lg font-display">
           <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#5B4FE8] to-[#7C6FF0] flex items-center justify-center font-bold text-[13px]">uJ</div>
           uJuzi
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
           <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-[18px] h-[18px]" />} label="Overview" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
           <SidebarItem active={currentView === 'courses'} icon={<BookOpen className="w-[18px] h-[18px]" />} label="Courses" onClick={() => setCurrentView('courses')} />
           <SidebarItem active={currentView === 'progress'} icon={<Activity className="w-[18px] h-[18px]" />} label="Progress" onClick={() => setCurrentView('progress')} />
           <SidebarItem active={currentView === 'planner'} icon={<Calendar className="w-[18px] h-[18px]" />} label="Planner" onClick={() => setCurrentView('planner')} />
           <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-[18px] h-[18px]" />} label="Settings" onClick={() => setCurrentView('profile')} />
        </nav>
        
        <div className="mt-auto">
           <SidebarItem active={false} icon={<LogOut className="w-[18px] h-[18px]" />} label="Log Out" onClick={onLogout} />
        </div>
        
        <div className="bg-[#FDF1DC] dark:bg-[#F5A623]/15 rounded-2xl p-4 mt-4 text-ink">
           <div className="font-mono text-[10px] uppercase tracking-widest text-ink/55 mb-1.5">Streak</div>
           <div className="font-display font-bold text-lg">🔥 {streakDays} {streakDays === 1 ? 'day' : 'days'}</div>
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
           <button onClick={() => {
             document.documentElement.classList.toggle('dark');
             const isDark = document.documentElement.classList.contains('dark');
             localStorage.setItem('theme', isDark ? 'dark' : 'light');
             // We could dispatch an event or just let it be, the CSS handles it
           }} className="w-10 h-10 rounded-full border border-border bg-surface-alt flex items-center justify-center text-slate-600 dark:text-slate-300 relative cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
             <svg className="w-[18px] h-[18px] block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             <svg className="w-[18px] h-[18px] hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
           </button>
           
           <button className="w-10 h-10 rounded-full border border-border bg-surface-alt flex items-center justify-center text-slate-600 relative cursor-pointer">
             <Bell className="w-[18px] h-[18px]" />
             <span className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-[#F5A623] rounded-full"></span>
           </button>
           
                      <button onClick={() => setCurrentView('profile')} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE8] to-[#7C6FF0] text-white flex items-center justify-center font-semibold text-[13px] cursor-pointer overflow-hidden border-2 border-transparent hover:border-accent transition-all">
             {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : (name ? name.charAt(0).toUpperCase() : 'U')}
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
