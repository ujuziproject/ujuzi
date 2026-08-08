import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CourseUpload } from './CourseUpload';
import { GlobalUploadFlow } from './GlobalUploadFlow';
import { CurriculumResults } from './CurriculumResults';
import { SemesterList } from './SemesterList';
import { GoalList } from './GoalList';
import { GoalDetail } from './GoalDetail';
import { SemesterDetail } from './SemesterDetail';
import { Curriculum, Topic } from '../types';
import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, Home, Play, Download, Folder, Target } from 'lucide-react';
import { useNavigationStore } from './MainApp';

interface DashboardProps {
  name: string;
  userId: string;
}


const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[] }>();

export function Dashboard({ name, userId, track, onNavigate }: DashboardProps & { track?: string, onNavigate?: (view: 'dashboard' | 'curricula' | 'progress' | 'profile') => void }) {
  const {
    dashboardView: view, setDashboardView: setView,
    dashboardCurriculumId: selectedCurriculumId, setDashboardCurriculumId: setSelectedCurriculumId,
    dashboardSemesterId: selectedSemesterId, setDashboardSemesterId: setSelectedSemesterId,
    dashboardGoalId: selectedGoalId, setDashboardGoalId: setSelectedGoalId,
    dashboardCourseId: selectedCourseId, setDashboardCourseId: setSelectedCourseId,
    dashboardTopicId: initialTopicId, setDashboardTopicId: setInitialTopicId
  } = useNavigationStore();
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);
  
  // Stats
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  
  // Weekly Goal
  const [weeklyGoal, setWeeklyGoal] = useState(() => parseInt(localStorage.getItem('weekly_goal') || '5', 10));
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(weeklyGoal.toString());

  const fetchDashboardData = async (forceRefetch = false) => {
    const cacheKey = userId;
    if (!forceRefetch && dashboardCache.has(cacheKey)) {
        const cached = dashboardCache.get(cacheKey)!;
        setCurricula(cached.curricula);
        setTotalTopics(cached.totalTopics);
        setTotalQuizzes(cached.totalQuizzes);
        setStreak(cached.streak);
        setMasteryStats(cached.masteryStats);
        if (cached.recentSessions) setRecentSessions(cached.recentSessions);
        if (cached.recommendations) setRecommendations(cached.recommendations);
        
        if (cached.curricula.length === 0) {
            setView('upload');
        } else {
            setView('home');
        }
        // Fetch in background
        fetchData();
        return;
    }
    setView('loading');
    await fetchData();
  };
  
  const fetchData = async () => {
    // 1. Fetch curricula
    const { data: currs } = await supabase.from('curricula').select('id, title, status, student_id').eq('student_id', userId).order('created_at', { ascending: false });
    const currsList = currs || [];

    // Fetch topics count and progress for each
    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
      const { data: curriculumTopics } = await supabase.from('topics').select('id').eq('curriculum_id', c.id);
      const topics = curriculumTopics || [];
      const topicCount = topics.length;
      let progress = 0;

      if (topicCount > 0) {
        const topicIds = topics.map(t => t.id);
        const { count: attemptedQuizzesCount } = await supabase
          .from('quiz_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', userId)
          .in('quiz_id', (await supabase.from('quizzes').select('id').in('topic_id', topicIds)).data?.map(q => q.id) || []);
        progress = attemptedQuizzesCount ? Math.min(Math.round((attemptedQuizzesCount / topicCount) * 100), 100) : 0;
      }
      return { ...c, topic_count: topicCount, progress };
    }));

    setCurricula(enrichedCurricula as any);

    // Total topics
    const totalT = enrichedCurricula.reduce((sum, c) => sum + c.topic_count, 0);
    setTotalTopics(totalT);

    // Quizzes taken
    const { count: quizCount } = await supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }).eq('student_id', userId);
    setTotalQuizzes(quizCount || 0);
    
    // Weekly Study Minutes
    const startOfWeek = new Date();
    startOfWeek.setHours(0,0,0,0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    
    const { data: weekSessions } = await supabase.from('study_sessions')
      .select('duration_seconds')
      .eq('student_id', userId)
      .gte('started_at', startOfWeek.toISOString());
      
    let weekTotalSecs = 0;
    if (weekSessions) {
      weekSessions.forEach(s => {
        let dur = s.duration_seconds || 1800; // cap active at 30m approx
        weekTotalSecs += dur;
      });
    }
    setWeeklyMinutes(Math.round(weekTotalSecs / 60));

    // Streak
    const { data: streakData } = await supabase.from('streaks').select('current_streak').eq('student_id', userId).maybeSingle();
    setStreak(streakData?.current_streak || 0);
    
    // Recommendations
    let recs: any[] = [];
    const { data: myInterests } = await supabase.from('student_interests').select('interest_id').eq('student_id', userId);
    if (myInterests && myInterests.length > 0) {
      const iIds = myInterests.map(i => i.interest_id);
      const { data: fetchRecs } = await supabase.from('interest_content').select('*').in('interest_id', iIds).limit(4);
      if (fetchRecs) {
          recs = fetchRecs;
          setRecommendations(recs);
      }
    }
    // calculate mastery
    let notStarted = 0;
    let inProgress = 0;
    let mastered = 0;
    
    const curriculumIds = currsList.map(c => c.id);
    if (curriculumIds.length > 0) {
      const { data: allTopics } = await supabase.from('topics').select('id, curriculum_id').in('curriculum_id', curriculumIds);
      if (allTopics && allTopics.length > 0) {
         const topicIds = allTopics.map(t => t.id);
         const { data: topicQuizzes } = await supabase.from('quizzes').select('id, topic_id').in('topic_id', topicIds);
         const { data: attempts } = await supabase.from('quiz_attempts').select('quiz_id, score').eq('student_id', userId);
         
         const topicStatus = new Map<string, { attempted: boolean, maxScore: number }>();
         topicIds.forEach(id => topicStatus.set(id, { attempted: false, maxScore: 0 }));
         
         if (topicQuizzes && attempts) {
             attempts.forEach(attempt => {
                 const q = topicQuizzes.find(tq => tq.id === attempt.quiz_id);
                 if (q) {
                     const status = topicStatus.get(q.topic_id);
                     if (status) {
                         status.attempted = true;
                         if (attempt.score > status.maxScore) status.maxScore = attempt.score;
                     }
                 }
             });
         }
         
         for (const [id, status] of Array.from(topicStatus.entries())) {
             if (!status.attempted) notStarted++;
             else if (status.maxScore >= 80) mastered++;
             else inProgress++;
         }
      }
    }
    
    const totalTopicsMastery = notStarted + inProgress + mastered || 1;
    const newMastery = {
       notStarted: Math.round((notStarted / totalTopicsMastery) * 100),
       inProgress: Math.round((inProgress / totalTopicsMastery) * 100),
       mastered: Math.round((mastered / totalTopicsMastery) * 100)
    };
    setMasteryStats(newMastery);
    
    // Fetch recent activity
    let formattedRecentSessions: any[] = [];
    const { data: recentSessionsData } = await supabase.from('study_sessions').select('*').eq('student_id', userId).not('ended_at', 'is', null).order('started_at', { ascending: false }).limit(5);
    if (recentSessionsData && recentSessionsData.length > 0) {
      const topicIds = recentSessionsData.map(s => s.topic_id);
      const { data: topicsList } = await supabase.from('topics').select('id, title').in('id', topicIds);
      formattedRecentSessions = recentSessionsData.map(s => {
        const t = (topicsList || []).find(x => x.id === s.topic_id);
        return {
          ...s,
          topic_title: t ? t.title : 'Unknown Topic'
        };
      });
    }
    setRecentSessions(formattedRecentSessions);

    dashboardCache.set(userId, { curricula: enrichedCurricula, totalTopics: totalT, totalQuizzes: quizCount || 0, streak: streakData?.current_streak || 0, masteryStats: newMastery, recentSessions: formattedRecentSessions, recommendations: recs });

    if (currsList.length === 0) {
      setView('upload');
    } else {
      setView('home');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const openCurriculum = (curriculumId: string, topicId?: string) => {
    setSelectedCurriculumId(curriculumId);
    setInitialTopicId(topicId);
    setView('curriculum');
  };

  if (view === 'loading') {
    return (
      <div className="w-full animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
          <div>
            <div className="h-12 w-96 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
            <div className="h-4 w-64 bg-slate-100 rounded-md animate-pulse"></div>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="h-12 w-40 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="h-12 w-48 bg-slate-300 rounded-full animate-pulse"></div>
          </div>
        </div>
        {/* Hero Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="col-span-1 lg:col-span-2 bg-slate-100 rounded-[2rem] h-[340px] animate-pulse"></div>
          <div className="col-span-1 bg-slate-50 rounded-[2rem] border border-border h-[340px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (view === 'upload') {
    return (
      <div className="w-full">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">Add New Materials</h1>
          <p className="text-slate-500">Select where to add your new study materials.</p>
        </div>
        <GlobalUploadFlow userId={userId} track={track} onUploadComplete={() => fetchDashboardData(true)} />
      </div>
    );
  }

  if (view === 'semesterDetail' && selectedSemesterId) {
    return (
      <SemesterDetail 
        semesterId={selectedSemesterId} 
        userId={userId} 
        onOpenCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setView('courseDetail');
        }}
        onBack={() => setView('home')}
      />
    );
  }
  if (view === 'courseDetail' && selectedCourseId) {
    return (
      <div className="w-full">
        <button onClick={() => setView(track === 'independent' ? 'goalDetail' : 'semesterDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to {track === 'independent' ? 'Goal' : 'Semester'}
        </button>
        <CurriculumResults courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }
  
  if (view === 'goalDetail' && selectedGoalId) {
    return (
      <GoalDetail 
        goalId={selectedGoalId} 
        userId={userId} 
        onOpenCourse={(courseId) => {
          setSelectedCourseId(courseId);
          setView('courseDetail');
        }}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'curriculum' && selectedCurriculumId) {
    return (
      <div className="w-full">
        <button onClick={() => setView('home')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <Home className="w-4 h-4" /> Back to Dashboard
        </button>
        <CurriculumResults curriculumId={selectedCurriculumId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }

  const firstName = name.split(' ')[0].toUpperCase();

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* Header */}
      {(totalTopics > 0 || curricula.length > 0) && (
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-[2.75rem] font-black uppercase tracking-tight text-ink font-display leading-[1.1]">
            WELCOME BACK, <span className="text-accent">{firstName}!</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's how your learning is going today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button onClick={() => onNavigate && onNavigate('progress')} className="px-5 py-3 rounded-full border border-border text-sm font-bold bg-surface-alt text-ink hover:bg-surface flex items-center gap-2 transition-colors">
            <TrendingUp className="w-4 h-4" /> Progress Report
          </button>
          <button 
            onClick={() => setView('upload')}
            className="px-6 py-3 rounded-full bg-ink text-white text-sm font-bold hover:bg-ink/90 flex items-center gap-2 transition-colors"
          >
            + Add Materials
          </button>
        </div>
      </div>
      )}

      {/* Hero Cards */}
      {totalTopics === 0 && curricula.length === 0 ? (
          <div className="bg-surface-alt rounded-[2rem] border border-border p-8 md:p-12 mb-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
                <h2 className="text-2xl font-black text-ink mb-4 font-display">Let's get started with your learning journey</h2>
                <p className="text-slate-500 mb-8 max-w-2xl leading-relaxed">
                    Your dashboard is looking a little empty. Follow these simple steps to start turning your study materials into interactive, AI-powered learning experiences.
                </p>
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-ink text-white font-bold flex items-center justify-center shrink-0">1</div>
                        <div>
                            <h3 className="font-bold text-ink mb-1">Add your materials</h3>
                            <p className="text-sm text-slate-500">Upload your curriculum, syllabus, or learning goals.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center shrink-0">2</div>
                        <div>
                            <h3 className="font-bold text-ink mb-1">Take a quiz</h3>
                            <p className="text-sm text-slate-500">Test your knowledge on generated topics.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center shrink-0">3</div>
                        <div>
                            <h3 className="font-bold text-ink mb-1">Review flashcards</h3>
                            <p className="text-sm text-slate-500">Build mastery through spaced repetition.</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setView('upload')}
                    className="mt-8 px-8 py-4 rounded-full bg-accent text-white font-bold hover:bg-accent/90 transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                    + Add Materials Now
                </button>
            </div>
            <div className="hidden md:block w-64 h-64 bg-accent/5 rounded-full border-4 border-accent/10 flex items-center justify-center shrink-0">
                <div className="w-48 h-48 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                    <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
            </div>
          </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {/* Black Card */}
        <div className="col-span-1 lg:col-span-2 bg-ink rounded-[2rem] p-8 md:p-10 text-white flex flex-col justify-between min-h-[340px] relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest font-display">Total Topics</span>
              
            </div>
            <div className="flex items-center gap-1">
              <span className="text-6xl md:text-8xl font-black tracking-tighter font-display leading-none">{totalTopics}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-12 relative z-10">
            <div className="bg-[#1A1A1A] border border-[#222] rounded-2xl p-5 min-w-[150px] flex-1 md:flex-none">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 font-display">Quizzes Taken</span>
              <span className="text-2xl font-black font-display text-success">{totalQuizzes}</span>
            </div>
            <div className="bg-[#1A1A1A] border border-[#222] rounded-2xl p-5 min-w-[150px] flex-1 md:flex-none">
              <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2 font-display">Day Streak</span>
              <span className="text-2xl font-black font-display text-white">{streak}</span>
            </div>
          </div>
        </div>


        
        {/* Allocation Card */}
        <div className="col-span-1 bg-surface-alt rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px]">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8 block font-display">Topic Mastery</span>
          <div className="flex gap-2 h-[4.5rem] mb-8 w-full overflow-hidden">
            {masteryStats.mastered > 0 && <div className="bg-success rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.mastered}%` }}></div>}
            {masteryStats.inProgress > 0 && <div className="bg-accent-warm rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.inProgress}%` }}></div>}
            {masteryStats.notStarted > 0 && <div className="bg-slate-100 rounded-xl transition-all duration-1000" style={{ width: `${masteryStats.notStarted}%` }}></div>}
            {masteryStats.mastered === 0 && masteryStats.inProgress === 0 && masteryStats.notStarted === 0 && <div className="bg-slate-100 rounded-xl flex-1"></div>}
          </div>
          <div className="space-y-5 flex-1">
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-success"></div> Mastered</div>
              <span className="text-slate-600 font-medium">{masteryStats.mastered}%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-accent-warm"></div> In Progress</div>
              <span className="text-slate-600 font-medium">{masteryStats.inProgress}%</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-slate-200"></div> Not Started</div>
              <span className="text-slate-600 font-medium">{masteryStats.notStarted}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Goal Card */}
        <div className="col-span-1 bg-surface-alt rounded-[2rem] border border-border p-8 shadow-sm flex flex-col min-h-[340px] items-center justify-center text-center">
          <div className="flex justify-between items-center w-full mb-4">
             <span className="text-slate-500 text-xs font-bold uppercase tracking-widest font-display">Weekly Goal</span>
             <button onClick={() => setEditingGoal(!editingGoal)} className="text-xs text-accent font-bold hover:underline">
               {editingGoal ? 'Save' : 'Edit'}
             </button>
          </div>
          
          {editingGoal ? (
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <label className="text-sm font-bold text-ink mb-2">Target Hours</label>
              <input 
                type="number" 
                value={tempGoal} 
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-24 text-center text-3xl font-black font-display p-2 border-b-2 border-ink focus:outline-none mb-4"
              />
              <button 
                onClick={() => {
                   const val = parseInt(tempGoal, 10);
                   if (!isNaN(val) && val > 0) {
                      setWeeklyGoal(val);
                      localStorage.setItem('weekly_goal', val.toString());
                   }
                   setEditingGoal(false);
                }}
                className="bg-ink text-white px-4 py-2 rounded-full text-sm font-bold w-full"
              >
                Save Goal
              </button>
            </div>
          ) : (
            <div className="relative flex items-center justify-center flex-1 w-full flex-col">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-accent transition-all duration-1000 ease-out"
                    strokeDasharray="251.2"
                    strokeDashoffset={Math.max(0, 251.2 - (251.2 * Math.min(weeklyMinutes, weeklyGoal * 60) / (weeklyGoal * 60)))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black font-display text-ink">{Math.round((weeklyMinutes / (weeklyGoal * 60)) * 100)}%</span>
                </div>
              </div>
              <div className="text-sm font-bold text-ink">
                {Math.floor(weeklyMinutes / 60)}h {weeklyMinutes % 60}m <span className="text-slate-400 font-medium">/ {weeklyGoal}h</span>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Recent Activity List */}
      <div className="mb-12">
        <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">Recent Activity</h2>
        {recentSessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {recentSessions.map(s => (
              <div key={s.id} className="bg-surface-alt p-5 rounded-[1.5rem] border border-border hover:border-ink hover:shadow-md transition-all flex flex-col justify-between group">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                     <span className="bg-surface text-ink px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider group-hover:bg-ink group-hover:text-white transition-colors">{s.screen_type}</span>
                     <span className="text-xs font-semibold text-slate-400">{new Date(s.started_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                  </div>
                  <h4 className="font-bold text-sm text-ink line-clamp-2 leading-snug mb-4">{s.topic_title}</h4>
                </div>
                <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  {s.duration_seconds ? `${Math.floor(s.duration_seconds / 60)}m ${s.duration_seconds % 60}s` : 'In progress'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface p-8 rounded-[2rem] border border-border text-center text-sm font-medium text-slate-500 shadow-sm">
            No recent study sessions. Open a topic to start learning!
          </div>
        )}
      </div>

      {/* MY CURRICULA / SEMESTERS Section */}
      <div className="mb-12">
        {track === 'university' ? (
          <SemesterList 
            userId={userId} 
            onOpenSemester={(id) => {
              setSelectedSemesterId(id);
              setView('semesterDetail');
            }} 
          />
        ) : track === 'independent' ? (
          <GoalList 
            userId={userId} 
            onOpenGoal={(id) => {
              setSelectedGoalId(id);
              setView('goalDetail');
            }} 
          />
        ) : (
          <>
            <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">My Curricula</h2>
            {curricula.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {curricula.map(c => (
                  <button
                    key={c.id}
                    onClick={() => openCurriculum(c.id)}
                    className="flex flex-col text-left p-6 bg-surface-alt rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
                  >
                    <h3 className="text-lg font-bold text-ink mb-1 font-display">{c.title}</h3>
                    <div className="flex items-center justify-between w-full mt-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-mono">{c.topic_count} Topics</span>
                      </div>
                      <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${c.progress}%` }}></div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[360px]">
                <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center mb-6">
                  <Folder className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Active Curricula</h3>
                <p className="text-slate-500 font-medium mb-8 max-w-md">You haven't uploaded any curricula yet. Add your first syllabus to get started.</p>
                <button 
                  onClick={() => setView('upload')}
                  className="bg-ink text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-ink/90 transition-colors"
                >
                  + Add Materials
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {recommendations && recommendations.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display mb-6">Recommended for You</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {recommendations.map(r => (
              <a href={r.url} target="_blank" rel="noopener noreferrer" key={r.id} className="bg-surface-alt rounded-[1.5rem] border border-border p-5 hover:border-ink hover:shadow-md transition-all group flex flex-col h-full">
                <h3 className="font-bold text-ink mb-2 line-clamp-2">{r.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1">{r.description}</p>
                <div className="text-[10px] font-bold uppercase tracking-widest text-accent-warm group-hover:text-ink transition-colors">
                  {r.type}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
