import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Dashboard } from './Dashboard';
import { MyCurricula } from './MyCurricula';
import { MySemesters } from './MySemesters';
import { MyGoals } from './MyGoals';
import { Progress } from './Progress';
import { Profile } from './Profile';
import { Loader2, LayoutGrid, Folder, TrendingUp, Settings, LogOut, ChevronRight, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '../lib/utils';

interface MainAppProps {
  name: string;
  userId: string;
  onLogout: () => void;
}

function SidebarItem({ active, icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-bold transition-all w-full text-left font-display",
        active 
          ? "bg-accent-warm border border-ink text-ink shadow-[2px_2px_0px_#111]" 
          : "text-slate-500 hover:text-ink hover:bg-surface border border-transparent"
      )}
    >
      <span className={active ? "text-ink" : "text-slate-400"}>{icon}</span>
      {label}
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

export function MainApp({ name, userId, onLogout }: MainAppProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'dashboard' | 'curricula' | 'progress' | 'profile'>('dashboard');
  const [aiInsight, setAiInsight] = useState('Upload a curriculum to get your first personalized study plan and start tracking your progress.');
  const [learnerBadge, setLearnerBadge] = useState('Fresh Start');
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState('secondary');
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
    <div className="flex flex-col min-h-screen bg-surface font-sans text-ink">
      {/* Top Navbar Container */}
      <div className="p-4 md:p-6 pb-0 max-w-[1400px] mx-auto w-full">
        <div className="bg-surface-alt rounded-full px-6 py-4 flex items-center justify-between shadow-sm border border-border">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-black text-2xl tracking-tight leading-none text-ink font-display">uJuzi</span>
          </div>

          {/* Center Nav */}
          <div className="hidden md:flex flex-1 items-center justify-center font-bold text-sm text-ink font-display">
            {/* Nav items removed */}
          </div>

          {/* Right items */}
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={toggleTheme} className="hidden md:block text-ink hover:text-accent transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="hidden md:flex items-center gap-3 bg-accent-warm px-4 py-1.5 rounded-full border border-ink shadow-[2px_2px_0px_#111] cursor-pointer hover:bg-accent-warm/80 transition-colors" onClick={() => setCurrentView('profile')}>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase text-ink leading-tight">{name}</span>
                <span className="text-[9px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{learnerBadge}</span>
              </div>
            </div>
            <button onClick={() => setCurrentView('profile')} className="h-10 w-10 bg-accent text-white rounded-full flex items-center justify-center font-bold text-lg font-display shrink-0 border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
              {name.charAt(0).toUpperCase()}
            </button>
            <button onClick={onLogout} className="text-ink hover:text-accent transition-colors md:ml-2"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1400px] mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6 lg:gap-10">
        {/* Sidebar */}
        <div className="w-full md:w-[280px] shrink-0">
          <div className="bg-surface-alt rounded-[2rem] p-6 shadow-sm border border-border min-h-[500px] flex flex-col h-full sticky top-6">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 px-2 font-display">My Learning</h3>
            
            <nav className="flex flex-col gap-3">
              <SidebarItem active={currentView === 'dashboard'} icon={<LayoutGrid className="w-5 h-5" />} label="Dashboard" onClick={() => { setCurrentView('dashboard'); setDashboardView('home'); }} />
              <SidebarItem active={currentView === 'curricula'} icon={<Folder className="w-5 h-5" />} label={track === 'university' ? 'Semesters' : track === 'independent' ? 'My Goals' : 'Curricula'} onClick={() => setCurrentView('curricula')} />
              <SidebarItem active={currentView === 'progress'} icon={<TrendingUp className="w-5 h-5" />} label="Progress" onClick={() => setCurrentView('progress')} />
              <SidebarItem active={currentView === 'profile'} icon={<Settings className="w-5 h-5" />} label="Settings" onClick={() => setCurrentView('profile')} />
            </nav>

            <div className="mt-auto pt-8">
              <div className="bg-surface-alt rounded-2xl p-5 border border-border text-center md:text-left">
                <div className="text-xs font-black text-accent uppercase tracking-wider mb-2 font-display">AI Insight</div>
                <p className="text-sm font-semibold text-ink leading-snug">{aiInsight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 pb-20">
          {currentView === 'dashboard' && <Dashboard name={name} userId={userId} track={track} onNavigate={setCurrentView} />}
          {currentView === 'curricula' && track === 'university' && <MySemesters userId={userId} />}
          {currentView === 'curricula' && track === 'independent' && <MyGoals userId={userId} />}
          {currentView === 'curricula' && track === 'secondary' && <MyCurricula userId={userId} />}
          {currentView === 'progress' && <Progress userId={userId} />}
          {currentView === 'profile' && <Profile userId={userId} />}
        </div>
      </div>
    </div>
    </NavigationContext.Provider>
  );
}
