import CourseDetail from './CourseDetail';
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
import { Loader2, TrendingUp, Plus, BookOpen, Activity, ArrowLeft, ArrowRight, ChevronRight, Home, Play, Download, Folder, Target, Library } from 'lucide-react';
import { useNavigationStore } from './MainApp';

interface DashboardProps {
  name: string;
  userId: string;
}


const dashboardCache = new Map<string, { curricula: any[], totalTopics: number, totalQuizzes: number, streak: number, masteryStats: any, recentSessions?: any[], recommendations?: any[], cardsMastered?: number, quizAverage?: number, weeklyMinutes?: number }>();

export function Dashboard({ name, userId, track, onNavigate }: DashboardProps & { track?: string, onNavigate?: (view: any) => void }) {
  const {
    dashboardView: view, setDashboardView: setView,
    dashboardCurriculumId: selectedCurriculumId, setDashboardCurriculumId: setSelectedCurriculumId,
    dashboardSemesterId: selectedSemesterId, setDashboardSemesterId: setSelectedSemesterId,
    dashboardGoalId: selectedGoalId, setDashboardGoalId: setSelectedGoalId,
    dashboardCourseId: selectedCourseId, setDashboardCourseId: setSelectedCourseId,
    dashboardTopicId: initialTopicId, setDashboardTopicId: setInitialTopicId, setDashboardCourseId, setDashboardCurriculumId
  } = useNavigationStore();
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);
  
  // Stats
  const [totalTopics, setTotalTopics] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteryStats, setMasteryStats] = useState({ notStarted: 100, inProgress: 0, mastered: 0 });
  const [cardsMastered, setCardsMastered] = useState(0);
  const [quizAverage, setQuizAverage] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  
  // Weekly Goal
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [plannerItems, setPlannerItems] = useState<any[]>([]);
  const [weeklyGoal, setWeeklyGoal] = useState(300);

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
        if (cached.cardsMastered !== undefined) setCardsMastered(cached.cardsMastered);
        if (cached.quizAverage !== undefined) setQuizAverage(cached.quizAverage);
        if (cached.weeklyMinutes !== undefined) setWeeklyMinutes(cached.weeklyMinutes);
        
        setView('home');
        // Fetch in background
        fetchData();
        return;
    }
    setView('loading');
    await fetchData();
  };
  
  const fetchData = async () => {
    // 1. Fetch curricula
    // Fetch profile for track
    const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
    const track = profile?.track || 'secondary';

    const currsList: any[] = [];
    // Fetch all semesters
    const { data: sems } = await supabase.from('semesters').select('id, level_year, semester_number').eq('student_id', userId);
    if (sems && sems.length > 0) {
      const { data: cs } = await supabase.from('courses').select('id, course_title, semester_id').in('semester_id', sems.map(s => s.id));
      if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id, desc: `Semester ${sems.find(s=>s.id===c.semester_id)?.semester_number || ''}` })));
    }
    
    // Fetch all goals
    const { data: goals } = await supabase.from('learning_goals').select('id, goal_title').eq('student_id', userId);
    if (goals && goals.length > 0) {
      const { data: cs } = await supabase.from('courses').select('id, course_title, goal_id').in('goal_id', goals.map(g => g.id));
      if (cs) currsList.push(...cs.map(c => ({ id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id, desc: `Goal: ${goals.find(g=>g.id===c.goal_id)?.goal_title || ''}` })));
    }
    
    // Fetch standalone curricula
    const { data: currs } = await supabase.from('curricula').select('id, title').eq('student_id', userId);
    if (currs && currs.length > 0) {
      currsList.push(...currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id, desc: 'Subject' })));
    }
    
    // Fetch topics count and progress for each
    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
      let topicQuery = supabase.from('topics').select('id, title').order('order_index', { ascending: true });
      if (c.type === 'course') topicQuery = topicQuery.eq('course_id', c.id);
      else topicQuery = topicQuery.eq('curriculum_id', c.id);
      const { data: curriculumTopics } = await topicQuery;
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
    
    // Fetch all topics for the courses
    const allTopicIds: string[] = [];
    for (const curr of currsList) {
        let q = supabase.from('topics').select('id, title');
        if (curr.type === 'course') q = q.eq('course_id', curr.id);
        else q = q.eq('curriculum_id', curr.id);
        const { data: ts } = await q;
        if (ts) ts.forEach(t => allTopicIds.push(t.id));
    }
    
    if (allTopicIds.length > 0) {
      const allTopics = allTopicIds.map(id => ({ id }));
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
    
    // Calculate Cards Mastered
    let cMastered = 0;
    if (allTopicIds.length > 0) {
        const { data: fc } = await supabase.from('flashcards').select('id').in('topic_id', allTopicIds);
        if (fc && fc.length > 0) {
            const { count } = await supabase.from('flashcard_reviews').select('id', { count: 'exact', head: true })
                .eq('student_id', userId)
                .in('flashcard_id', fc.map(f => f.id))
                .gte('interval_days', 14);
            cMastered = count || 0;
        }
    }
    setCardsMastered(cMastered);
    
    // Calculate Quiz Average
    let qAvg = 0;
    const { data: qAttempts } = await supabase.from('quiz_attempts').select('score').eq('student_id', userId);
    if (qAttempts && qAttempts.length > 0) {
        const sum = qAttempts.reduce((acc, curr) => acc + curr.score, 0);
        qAvg = Math.round(sum / qAttempts.length);
    }
    setQuizAverage(qAvg);
    
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

    setView('home');
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
  if (view === 'courseDetail' && (selectedCourseId || selectedCurriculumId)) {
    return (
      <CourseDetail userId={userId} onNavigate={onNavigate || setView} />
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

  if (view === 'curriculum' && (selectedCurriculumId || selectedCourseId)) {
    return (
      <div className="w-full">
        <button onClick={() => setView('courseDetail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Course
        </button>
        <CurriculumResults curriculumId={selectedCurriculumId} courseId={selectedCourseId} userId={userId} initialTopicId={initialTopicId} />
      </div>
    );
  }


  const firstName = name ? name.split(' ')[0] : 'Student';
  const planDone = plannerItems.filter(i => i.completed).length;
  const planTotal = plannerItems.length;
  const isPlanUpToDate = planTotal > 0 && planDone === planTotal;
  const mostActiveCourse = curricula.length > 0 ? curricula[0] : null;
  const nextUpText = mostActiveCourse ? `Keep up the momentum in ${mostActiveCourse.title}!` : "Let's keep the momentum going!";
  
  const togglePlannerItem = async (item: any) => {
    const newVal = !item.completed;
    const upd = await supabase.from('planner_items').update({ completed: newVal, completed_at: newVal ? new Date().toISOString() : null }).eq('id', item.id).select('*').single();
    if (upd.data) {
      setPlannerItems(prev => prev.map(p => p.id === item.id ? upd.data : p));
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {/* Hero section */}
      
      <div className="bg-gradient-to-br from-[#110B30] to-[#1A114D] rounded-3xl p-8 md:p-11 mb-6 relative overflow-hidden text-white shadow-sm">
         <div className="relative z-10 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 bg-accent-warm/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold mb-4 backdrop-blur-sm">
               {totalTopics > 0 || curricula.length > 0 
                 ? (isPlanUpToDate ? "✦ Your plan is up to date" : "✦ You have tasks pending today")
                 : "✦ Ready to start"}
            </div>
               
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
               {totalTopics > 0 || curricula.length > 0 ? 'Welcome back' : 'Welcome to uJuzi'}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5A623] to-[#E85D8F]">{firstName}</span>.
            </h1>
               
            <p className="text-white/70 text-[15px] mb-6 max-w-xl">
               {totalTopics > 0 || curricula.length > 0 
                 ? nextUpText
                 : "Your dashboard is looking a little empty. Follow these simple steps to start turning your study materials into interactive, AI-powered learning experiences."}
            </p>
               
            <div className="flex flex-wrap items-center gap-3">
               {(totalTopics > 0 || curricula.length > 0) ? (
                 <>
                   <button onClick={() => {
                     const firstPending = plannerItems.find(i => !i.completed);
                     if (firstPending && firstPending.topic_id) {
                       setInitialTopicId(firstPending.topic_id);
                       setView('curriculum');
                     } else if (mostActiveCourse) {
                       setDashboardCourseId(mostActiveCourse.id);
                       setDashboardCurriculumId(mostActiveCourse.id);
                       setView('courseDetail');
                     }
                   }} className="bg-accent text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]">
                     <Play className="w-[18px] h-[18px] fill-current" /> Start today's session
                   </button>
                   <button onClick={() => { document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-transparent text-white border-2 border-white/25 px-6 py-[12px] rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-white/10 transition-colors">
                     Adjust plan <ArrowRight className="w-4 h-4" />
                   </button>
                 </>
               ) : (
                 <button 
                  onClick={() => setView('upload')}
                  className="bg-accent text-white px-6 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]"
                 >
                   <Plus className="w-[18px] h-[18px] fill-current" /> Add Materials
                 </button>
               )}
            </div>
         </div>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#5B4FE8]/20 to-[#9B5DE8]/20 blur-3xl rounded-full translate-x-1/4 -translate-y-1/4 pointer-events-none"></div>
      </div>
      
{/* Stats Cards */}
      {(totalTopics > 0 || curricula.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FDF1DC] dark:bg-accent-warm/15 rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Streak</span>
               <span className="opacity-70 text-[15px]">🔥</span>
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{streak} d</div>
          </div>
          
          <div className="bg-[#EDEBFC] dark:bg-accent/15 rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Cards Mastered</span>
               <Library className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{cardsMastered || 0}</div>
          </div>
          
          <div className="bg-surface-alt border border-border rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Quiz Average</span>
               <Target className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{quizAverage || 0}%</div>
          </div>
          
          <div className="bg-surface-alt border border-border rounded-[18px] p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
               <span className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink/60">Weekly Goal</span>
               <TrendingUp className="w-[15px] h-[15px] opacity-70" />
            </div>
            <div className="font-display font-bold text-[28px] tracking-tight">{Math.min(100, Math.round((weeklyMinutes / Math.max(1, weeklyGoal)) * 100))}%</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      {(totalTopics > 0 || curricula.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          
          {/* Active courses */}
          <div className="bg-surface-alt border border-border rounded-[20px] p-6 lg:p-7 h-fit" id="courses">
             <div className="flex justify-between items-center mb-4.5">
                <h3 className="font-display font-semibold text-[18px]">Active courses</h3>
                <button onClick={() => onNavigate && onNavigate('courses')} className="text-[13.5px] font-semibold text-[#5B4FE8] hover:underline">View all</button>
             </div>
             
             <div className="flex flex-col gap-3">
                {curricula.slice(0,3).map((c, i) => (
                   <button 
                     key={c.id} 
                     onClick={() => {
                        setDashboardCurriculumId(c.id);
                        setDashboardCourseId(c.id);
                        setView('courseDetail');
                     }}
                     className="block w-full text-left p-[18px] px-5 rounded-2xl bg-surface hover:bg-[#EDEBFC] dark:hover:bg-accent/15 transition-colors group"
                   >
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <h4 className="font-display font-semibold text-[16px] mb-1 group-hover:text-[#5B4FE8] transition-colors">{c.title}</h4>
                            <div className="text-[12.5px] text-ink/60">Next: {c.nextTopic}</div>
                         </div>
                         <div className="font-mono font-semibold text-[14px] text-[#5B4FE8]">{c.progress}%</div>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                         <div className="h-full bg-accent rounded-full" style={{ width: `${c.progress}%` }}></div>
                      </div>
                   </button>
                ))}
                {curricula.length === 0 && <div className="text-sm text-slate-500 py-4 text-center">No active courses yet.</div>}
             </div>
          </div>

          {/* Today's plan */}
          <div className="bg-surface-alt border border-border rounded-[20px] p-6 lg:p-7 h-fit" id="planner">
             <div className="mb-4">
               <h3 className="font-display font-semibold text-[18px] mb-0.5">Today's plan</h3>
               <div className="text-[12.5px] text-ink/60 -mt-1.5">{planDone}/{planTotal} completed</div>
             </div>
             
             <div className="flex flex-col gap-2.5">
                 {plannerItems.map((item, i) => (
                   <div key={item.id} className={`flex items-center gap-3.5 p-3.5 px-4 rounded-xl transition-colors ${item.completed ? 'bg-surface/50 opacity-60' : 'bg-surface'}`}>
                     <button onClick={() => togglePlannerItem(item)} className={`w-[22px] h-[22px] rounded-full border-2 shrink-0 transition-colors ${item.completed ? 'bg-[#2FBF8F] border-[#2FBF8F] flex items-center justify-center' : 'border-border hover:border-slate-300'}`}>
                        {item.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                     </button>
                     <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10.5px] text-[#5B4FE8] uppercase tracking-[0.05em] mb-1 leading-none">{item.scheduled_time || 'ANYTIME'} · {item.item_type}</div>
                        <div className={`text-[14.5px] font-medium truncate ${item.completed ? 'line-through text-ink/60' : 'text-ink'}`}>{item.title}</div>
                     </div>
                   </div>
                 ))}
                 {plannerItems.length === 0 && <div className="text-sm text-slate-500 py-4 text-center">No tasks scheduled for today.</div>}
             </div>
          </div>
        </div>
      )}
    </div>
  );

}
