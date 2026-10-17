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
import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun, Search, Bell, Library, CheckSquare, Calendar, BookOpen, Activity } from 'lucide-react';
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
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'flashcards' | 'quizzes' | 'planner' | 'curricula' | 'progress' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
  const [learnerBadge, setLearnerBadge] = useState('Fresh Start');
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('secondary');
  const [streakDays, setStreakDays] = useState(0);
  const [studiedToday, setStudiedToday] = useState(false);
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
        supabase.from('streaks').select('current_streak, last_active_date').eq('student_id', userId).maybeSingle(),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('flashcard_reviews').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('student_interests').select('*', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('curricula').select('*', { count: 'exact', head: true }).eq('student_id', userId)
      ]);
      
      if (profileRes.data?.track) setTrack(profileRes.data.track);

      // A streak only counts if they studied today or yesterday
      const lastActive = streaksRes.data?.last_active_date || '';
      const today = localDateStr();
      const yesterday = localDateStr(addDays(new Date(), -1));
      const streakDays = lastActive >= yesterday ? (streaksRes.data?.current_streak || 0) : 0;
      setStreakDays(streakDays);
      setStudiedToday(lastActive === today);
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
              <div className="font-display font-extrabold text-[22px] tracking-tight mb-0.5">{streakDays} {streakDays === 1 ? 'day' : 'days'} <span className="opacity-90">🔥</span></div>
              <div className={cn("text-[12px] font-medium", streakDays > 0 && !studiedToday ? "text-[#F5A623]" : "text-white/50")}>
                {streakDays === 0
                  ? 'Study today to start a streak.'
                  : studiedToday
                    ? 'Safe for today. See you tomorrow.'
                    : `Study today or lose your ${streakDays}-day streak.`}
              </div>
           </div>
        </div>
      </div>
      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="h-[96px] px-8 md:px-10 flex items-center gap-5 sticky top-0 z-40 bg-white">
           <div className="flex-1 flex justify-center">
             <div className="w-full max-w-[1240px] flex items-center gap-3 bg-[#F8F9FA] rounded-[18px] px-5 py-3.5 text-slate-400 text-[15px] font-medium border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]">
                <Search className="w-[18px] h-[18px] text-slate-400" /> 
                <input type="text" placeholder="Search topics, courses, flashcards..." className="bg-transparent border-none outline-none flex-1 placeholder:text-slate-400 text-ink" />
                <div className="ml-auto font-mono text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 shadow-sm">⌘K</div>
             </div>
           </div>
           
           <button className="w-[44px] h-[44px] rounded-full bg-[#F8F9FA] border border-slate-100 flex items-center justify-center text-slate-500 relative cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
             <Bell className="w-5 h-5" />
             <span className="absolute top-[11px] right-[11px] w-2 h-2 bg-[#F5A623] rounded-full border-2 border-white"></span>
           </button>
           
           <div className="relative shrink-0">
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
        {/* Content Area */}
        <main className="flex-1 p-8 max-w-[1240px] w-full mx-auto">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
          {currentView === 'courses' && <MyCourses userId={userId} onNavigate={setCurrentView} />}
          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
                    {currentView === 'progress' && <Progress userId={userId} />}
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
