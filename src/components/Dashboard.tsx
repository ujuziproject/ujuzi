import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2, BookOpen, Target, TrendingUp, Library, ArrowRight } from 'lucide-react';
import { GlobalUploadFlow } from './GlobalUploadFlow';
import { CurriculumResults } from './CurriculumResults';
import { SemesterDetail } from './SemesterDetail';
import CourseDetail from './CourseDetail';
import { GoalDetail } from './GoalDetail';

import { useNavigationStore } from './MainApp';
import { localDateStr, parseLocalDate, addDays, daysUntil, startOfWeekLocal } from '../lib/dates';
import { loadTryItPlan } from '../lib/tryItPlan';
import { openTopic } from '../lib/navigation';

interface DashboardProps {
  name: string;
  userId: string;
  track?: string;
  onNavigate?: (view: any) => void;
}

function ChecklistItem({ title, subText, complete, actionText, onAction, icon: Icon, darkButton }: any) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-[20px] mb-3 ${complete ? 'bg-[#E2F7EB]' : 'bg-white border border-slate-100 shadow-sm'}`}>
       <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${complete ? 'bg-[#6C5CE7] text-white' : 'bg-[#F4F4F6] text-slate-500'}`}>
             {complete ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg> : Icon && <Icon className="w-5 h-5" />}
          </div>
          <div>
            <div className={`font-bold text-[15px] ${complete ? 'text-slate-500 line-through' : 'text-[#110B29]'}`}>{title}</div>
            <div className="text-[13px] text-slate-500 font-medium">{subText}</div>
          </div>
       </div>
       <div className="flex items-center gap-3">
          {!complete && actionText && (
            <button onClick={onAction} className={`text-[13px] font-bold px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-colors ${darkButton ? 'bg-[#110B29] text-white hover:bg-[#1A114D]' : 'bg-[#6C5CE7] text-white hover:bg-[#5B4FE8]'}`}>
              {actionText} {darkButton ? <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/></svg> : <ArrowRight className="w-4 h-4" />}
            </button>
          )}
       </div>
    </div>
  );
}

function DashboardHome({ name, userId, track, onNavigate }: DashboardProps) {
  const { setCurrentView, setDashboardView, setDashboardCourseId, setDashboardCurriculumId, setDashboardTopicId } = useNavigationStore();
  
  const [streak, setStreak] = useState(0);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjusted, setAdjusted] = useState(false);

  const [cardsMastered, setCardsMastered] = useState(0);
  const [quizAverage, setQuizAverage] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [topicsLeft, setTopicsLeft] = useState(0);
  
  const [weeklyGoal, setWeeklyGoal] = useState(300);
  const [pendingPlan] = useState(() => loadTryItPlan());
  const [loaded, setLoaded] = useState(false);
  const [continueTopic, setContinueTopic] = useState<{ id: string; title: string; course_id: string | null; curriculum_id: string | null } | null>(null);
  const [todayItems, setTodayItems] = useState<any[]>([]);
  const [setupTasks, setSetupTasks] = useState({
    profile: false,
    interests: false,
    learningStyle: false,
    course: false,
    materials: false
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      const [profileRes, streakRes, interestsRes, attemptsRes, masteredRes, sessionsRes, semsRes, goalsRes, currRes, notesRes, plannerRes] = await Promise.all([
        supabase.from('student_profiles').select('track, learning_style_set_at, weekly_goal_minutes, exam_date, exam_year').eq('id', userId).maybeSingle(),
        supabase.from('streaks').select('current_streak, last_active_date').eq('student_id', userId).maybeSingle(),
        supabase.from('student_interests').select('interest_id', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('quiz_attempts').select('score, total_questions').eq('student_id', userId),
        supabase.from('flashcard_reviews').select('id', { count: 'exact', head: true }).eq('student_id', userId).gte('interval_days', 14),
        supabase.from('study_sessions').select('duration_seconds').eq('student_id', userId).not('duration_seconds', 'is', null).gte('started_at', startOfWeekLocal().toISOString()),
        supabase.from('semesters').select('id, target_end_date').eq('student_id', userId).order('level_year', { ascending: false }).order('semester_number', { ascending: false }),
        supabase.from('learning_goals').select('id, target_date').eq('student_id', userId).order('created_at', { ascending: false }),
        supabase.from('curricula').select('id', { count: 'exact', head: true }).eq('student_id', userId),
        supabase.from('lecture_notes').select('id', { count: 'exact', head: true }),
        supabase.from('planner_items').select('id', { count: 'exact', head: true }).eq('student_id', userId).eq('completed', false).eq('item_type', 'notes')
      ]);
      if (cancelled) return;

      const profile = profileRes.data;
      const sems = semsRes.data || [];
      const goals = goalsRes.data || [];

      // Streak — a streak is only "current" if the student studied today or yesterday
      const s = streakRes.data;
      const yesterday = localDateStr(addDays(new Date(), -1));
      setStreak(s && s.last_active_date && s.last_active_date >= yesterday ? s.current_streak : 0);

      // Quiz average — score is a raw count of correct answers, so convert each attempt to a percentage
      const attempts = (attemptsRes.data || []).filter(a => a.total_questions > 0);
      setQuizAverage(attempts.length
        ? Math.round(attempts.reduce((sum, a) => sum + (a.score / a.total_questions) * 100, 0) / attempts.length)
        : 0);

      // Cards mastered — reviewed far enough apart that the review interval reached 14+ days
      setCardsMastered(masteredRes.count || 0);

      // Weekly goal — completed study sessions since Monday
      const secs = (sessionsRes.data || []).reduce((sum, r) => sum + (r.duration_seconds || 0), 0);
      setWeeklyMinutes(Math.round(secs / 60));
      setWeeklyGoal(profile?.weekly_goal_minutes || 300);

      // Courses exist? Courses belong to a semester or a goal; secondary subjects live in curricula
      let courseCount = currRes.count || 0;
      if (sems.length > 0) {
        const { count } = await supabase.from('courses').select('id', { count: 'exact', head: true }).in('semester_id', sems.map(x => x.id));
        courseCount += count || 0;
      }
      if (goals.length > 0) {
        const { count } = await supabase.from('courses').select('id', { count: 'exact', head: true }).in('goal_id', goals.map(x => x.id));
        courseCount += count || 0;
      }
      if (cancelled) return;

      setSetupTasks({
        profile: !!profile?.track,
        interests: (interestsRes.count || 0) > 0,
        learningStyle: !!profile?.learning_style_set_at,
        course: courseCount > 0,
        materials: (notesRes.count || 0) > 0
      });

      // Countdown to the student's target date
      const t = profile?.track || track;
      let target: Date | null = null;
      if (t === 'university' && sems[0]?.target_end_date) target = parseLocalDate(sems[0].target_end_date);
      else if (t === 'independent' && goals[0]?.target_date) target = parseLocalDate(goals[0].target_date);
      else if (t === 'secondary') {
        if (profile?.exam_date) target = parseLocalDate(profile.exam_date);
        else if (profile?.exam_year) target = new Date(profile.exam_year, 5, 30);
      }
      setDaysLeft(target ? daysUntil(target) : null);
      setTopicsLeft(plannerRes.count || 0);

      // For returning students: today's plan and where to pick up
      const [todayRes, lastRes] = await Promise.all([
        supabase.from('planner_items').select('id, title, item_type, topic_id, completed').eq('student_id', userId).eq('scheduled_date', localDateStr()).order('created_at'),
        supabase.from('study_sessions').select('topic_id').eq('student_id', userId).order('started_at', { ascending: false }).limit(1),
      ]);
      if (cancelled) return;
      const items = todayRes.data || [];
      setTodayItems(items);
      const pickTopicId = lastRes.data?.[0]?.topic_id || items.find(i => !i.completed && i.topic_id)?.topic_id;
      let topic: any = null;
      if (pickTopicId) {
        const { data } = await supabase.from('topics').select('id, title, course_id, curriculum_id').eq('id', pickTopicId).maybeSingle();
        topic = data;
      }
      if (!topic) {
        const { data } = await supabase.from('topics').select('id, title, course_id, curriculum_id').order('created_at', { ascending: false }).limit(1);
        topic = data?.[0] || null;
      }
      if (cancelled) return;
      setContinueTopic(topic);
      setLoaded(true);
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, [userId]);

  const weeklyPercent = weeklyGoal > 0 ? Math.min(100, Math.round((weeklyMinutes / weeklyGoal) * 100)) : 0;

  const firstName = name ? name.split(' ')[0] : 'Student';
  
  const setupTasksCount = Object.values(setupTasks).filter(Boolean).length + 1; // +1 for account
  const setupProgressPercent = Math.round((setupTasksCount / 6) * 100);
  // Once a student has a course with materials, the Overview switches from setup to daily study
  const returning = loaded && setupTasks.course && setupTasks.materials;

  const toggleTodayItem = async (item: any) => {
    const completed = !item.completed;
    setTodayItems(prev => prev.map(i => i.id === item.id ? { ...i, completed } : i));
    await supabase.from('planner_items').update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq('id', item.id);
  };
  const openTodayItem = async (item: any) => {
    if (!item.topic_id) { setCurrentView('planner'); return; }
    const { data } = await supabase.from('topics').select('id, course_id, curriculum_id').eq('id', item.topic_id).maybeSingle();
    if (data) openTopic({ setCurrentView, setDashboardView, setDashboardCourseId, setDashboardCurriculumId, setDashboardTopicId }, data);
  };
  const todayDone = todayItems.filter(i => i.completed).length;

  return (
    <div className="w-full animate-in fade-in duration-500">
      {pendingPlan && (
        <div className="mb-6 rounded-[24px] border border-[#F5A623]/40 bg-[#FFF6D9] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" role="status">
          <div>
            <div className="font-bold text-[#110B29] text-[16px]">“{pendingPlan.name}” isn't saved yet</div>
            <div className="text-[14px] text-[#7A5B1E] mt-0.5">The {pendingPlan.topics.length} {pendingPlan.topics.length === 1 ? 'topic' : 'topics'} you mapped out before signing up are only in this browser. Save them as a course so you don't lose them.</div>
          </div>
          <button onClick={() => setDashboardView('upload')} className="shrink-0 bg-[#110B29] text-white px-6 py-3 rounded-full font-bold text-[14px] flex items-center gap-2 hover:bg-[#1A114D] transition-colors">
            Save my plan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
      {returning && (
        <>
          {/* Returning student: pick up where you left off */}
          <div className="bg-gradient-to-br from-[#271E42] via-[#2D1F5B] to-[#43236C] rounded-[32px] p-7 md:p-12 mb-8 relative overflow-hidden text-white shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-8">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8A55B]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="relative z-10 max-w-[560px]">
              <h1 className="text-3xl md:text-[46px] font-extrabold tracking-tight mb-3 text-white leading-[1.1] font-display">
                Welcome back,{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5A623] to-[#FF8C9D]">{firstName}.</span>
              </h1>
              <p className="text-white/70 text-[15px] md:text-[16px] mb-7 leading-relaxed">
                {daysLeft !== null && daysLeft > 0
                  ? `${daysLeft} days to your target date · ${topicsLeft} ${topicsLeft === 1 ? 'topic' : 'topics'} still to cover.`
                  : todayItems.length > 0
                    ? `${todayDone} of ${todayItems.length} tasks done today.`
                    : 'Pick up where you left off.'}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {continueTopic && (
                  <button
                    onClick={() => openTopic({ setCurrentView, setDashboardView, setDashboardCourseId, setDashboardCurriculumId, setDashboardTopicId }, continueTopic)}
                    className="bg-[#6C5CE7] text-white px-6 py-3.5 rounded-full font-bold text-[14px] flex items-center gap-2 hover:bg-[#5B4FE8] transition-colors shadow-sm max-w-full"
                  >
                    <span className="truncate">Continue: {continueTopic.title}</span> <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                )}
                <button onClick={() => setDashboardView('upload')} className="bg-white/5 text-white border-2 border-white/20 px-6 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors">
                  Add a course
                </button>
              </div>
            </div>
            <div className="relative z-10 hidden md:flex items-center justify-center">
              <div className="w-44 h-44 rounded-[36px] bg-white/5 border border-white/10 flex flex-col items-center justify-center relative">
                <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F5A623" strokeWidth="3" strokeDasharray="97.39" strokeDashoffset={97.39 - (weeklyPercent / 100) * 97.39} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] font-extrabold text-white">{weeklyPercent}%</span>
                  <span className="text-[10px] font-bold tracking-[0.15em] text-white/50 uppercase">Weekly goal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's plan */}
          <div className="bg-white rounded-[28px] p-6 md:p-8 mb-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-5 gap-4">
              <div>
                <h3 className="font-display font-extrabold text-[22px] text-[#110B29] tracking-tight">Today's plan</h3>
                <p className="text-slate-500 text-[14px] mt-1 font-medium">
                  {todayItems.length === 0 ? 'Nothing scheduled for today.' : todayDone === todayItems.length ? 'All done for today. Great work!' : `${todayItems.length - todayDone} left to do.`}
                </p>
              </div>
              <button onClick={() => setCurrentView('planner')} className="text-[13px] font-bold text-accent hover:underline shrink-0">Open Planner →</button>
            </div>
            {todayItems.length > 0 ? (
              <div className="flex flex-col gap-2.5">
                {todayItems.map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-3.5 rounded-2xl border ${item.completed ? 'bg-[#E2F7EB] border-transparent' : 'bg-white border-slate-100'}`}>
                    <button
                      onClick={() => toggleTodayItem(item)}
                      aria-label={item.completed ? 'Mark as not done' : 'Mark as done'}
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 ${item.completed ? 'bg-[#34A853] border-[#34A853] text-white' : 'border-slate-300 hover:border-accent'}`}
                    >
                      {item.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openTodayItem(item)} className={`flex-1 min-w-0 text-left font-semibold text-[14.5px] truncate hover:text-accent ${item.completed ? 'line-through text-slate-500' : 'text-[#110B29]'}`}>
                      {item.title}
                    </button>
                    <span className="text-[11px] font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">{item.item_type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-[14px] text-slate-500">
                {continueTopic ? <>A good time to review <strong className="text-ink">{continueTopic.title}</strong> — or open the Planner to build your schedule.</> : 'Open the Planner to build your schedule.'}
              </div>
            )}
          </div>
        </>
      )}

      {loaded && !returning && (
        <>
      {/* Hero section */}
      <div className="bg-gradient-to-br from-[#271E42] via-[#2D1F5B] to-[#43236C] rounded-[32px] p-7 md:p-14 mb-10 relative overflow-hidden text-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E8A55B]/10 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col items-start max-w-[500px]">
            <div className="mb-8 bg-[#372661]/40 border border-[#8C76D2]/20 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide backdrop-blur-sm flex items-center gap-2">
               <span>🚀</span> Your syllabus, decoded
            </div>
            
            <h1 className="text-4xl md:text-[52px] font-extrabold tracking-tight mb-4 text-white leading-[1.1] font-display">
               Welcome to uJuzi,<br />
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F5A623] to-[#FF8C9D]">
                  {firstName}.
               </span>
            </h1>
            
            <p className="text-white/70 text-[16px] mb-10 leading-relaxed max-w-[420px]">
               {6 - setupTasksCount > 0
                   ? `You're ${6 - setupTasksCount} step${6 - setupTasksCount === 1 ? '' : 's'} from your first AI-built study pack. Finish setup and we'll turn your syllabus into notes, cards and quizzes.`
                  : (daysLeft !== null && daysLeft > 0) ? `${daysLeft} days left — ${topicsLeft} topics still uncovered before your exam.` : `You're all set! We've turned your syllabus into notes, cards and quizzes.`}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
                 <button 
                  onClick={() => setDashboardView('upload')}
                  className="bg-[#6C5CE7] text-white px-7 py-3.5 rounded-full font-bold text-[14px] flex items-center gap-2 hover:bg-[#5B4FE8] transition-colors shadow-sm"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                   {setupTasks.course ? 'Add a course' : 'Add your first course'} <ArrowRight className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={async () => {
                     setIsAdjusting(true);
                     const { adjustStudyPlan } = await import('../lib/pacing');
                     await adjustStudyPlan(userId, track || 'secondary');
                     setIsAdjusting(false);
                     setAdjusted(true);
                     setTimeout(() => setAdjusted(false), 3000);
                   }}
                   disabled={isAdjusting}
                   className="bg-white/5 text-white border-2 border-white/20 px-7 py-3 rounded-full font-bold text-[14px] hover:bg-white/10 transition-colors flex items-center gap-2 disabled:opacity-50">
                   {isAdjusting ? <Loader2 className="w-4 h-4 animate-spin" /> : (adjusted ? <CheckCircle2 className="w-4 h-4" /> : null)}
                   {isAdjusting ? 'Updating...' : (adjusted ? 'Plan Updated' : 'Adjust plan')}
                 </button>
            </div>
         </div>
         
         <div className="relative z-10 hidden md:flex items-center justify-center mr-6">
            <div className="w-52 h-52 rounded-[40px] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col items-center justify-center relative shadow-2xl">
               <svg className="w-[140px] h-[140px] transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#F5A623" strokeWidth="3" strokeDasharray="97.39" strokeDashoffset={97.39 - (setupProgressPercent / 100) * 97.39} strokeLinecap="round" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                  <span className="text-[34px] font-extrabold text-white tracking-tight">{setupProgressPercent}%</span>
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase mt-1">Set up</span>
               </div>
               <div className="absolute bottom-5 text-[10px] font-bold tracking-widest text-[#F5A623] uppercase">
                 {setupTasksCount} of 6 steps
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[32px] p-8 md:p-10 mb-10 shadow-sm border border-slate-100">
         <div className="flex justify-between items-end mb-6">
            <div>
               <h3 className="font-display font-extrabold text-[24px] text-[#110B29] tracking-tight">Your launch quests</h3>
               <p className="text-slate-500 text-[14.5px] mt-1 font-medium">Tick them off — each one sharpens what uJuzi builds for you.</p>
            </div>
            <div className="text-[11px] font-bold tracking-wider text-[#6C5CE7] bg-[#E2F7EB] px-3.5 py-1.5 rounded-md uppercase">{setupTasksCount}/6 Complete</div>
         </div>
         
         <div className="flex flex-col gap-0">
            <ChecklistItem title="Create your account" subText="Welcome aboard" complete={true} />
            <ChecklistItem title="Complete your academic profile" subText="So we match your level" complete={setupTasks.profile} />
            <ChecklistItem title="Take the learning style quiz" subText="Visual? Practice-first?" complete={setupTasks.learningStyle} />
            
            <ChecklistItem 
              title="Add your first course" 
              subText="Drop in a syllabus or outline" 
              complete={setupTasks.course} 
              actionText="Add materials" 
              onAction={() => setDashboardView('upload')}
              icon={(props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
            />
            
            <ChecklistItem 
              title="Generate your first study materials" 
              subText="Notes, flashcards & quizzes in one tap" 
              complete={setupTasks.materials} 
              actionText="Generate"
              onAction={() => setCurrentView('courses')}
              darkButton={true}
              icon={(props: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/></svg>}
            />
         </div>
      </div>

        </>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
        <div className="bg-[#FFF6D9] rounded-[28px] p-7 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-6">
             <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#A5824C]">Streak</span>
             <span className="opacity-70 text-[18px]">🔥</span>
          </div>
          <div className="font-display font-extrabold text-[40px] tracking-tight text-[#110B29] leading-none mb-3">{`${streak} d`}</div>
          <span className="text-[13.5px] text-[#A5824C] font-semibold leading-tight">{streak === 0 ? 'Study today to start one' : 'Keep it going!'}</span>
        </div>
        
        <div className="bg-[#EAE4FF] rounded-[28px] p-7 flex flex-col shadow-sm">
          <div className="flex justify-between items-start mb-6">
             <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-[#695D94]">Cards Mastered</span>
             <Library className="w-[18px] h-[18px] opacity-70 text-[#695D94]" />
          </div>
          <div className="font-display font-extrabold text-[40px] tracking-tight text-[#110B29] leading-none mb-3">{cardsMastered || 0}</div>
          <span className="text-[13.5px] text-[#695D94] font-semibold leading-tight">{cardsMastered === 0 ? 'Your first deck awaits' : 'Great job!'}</span>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-[28px] p-7 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
             <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Quiz Average</span>
             <Target className="w-[18px] h-[18px] opacity-70 text-slate-400" />
          </div>
          <div className="font-display font-extrabold text-[40px] tracking-tight text-[#110B29] leading-none mb-3">{quizAverage > 0 ? `${quizAverage}%` : '0%'}</div>
          <span className="text-[13.5px] text-slate-400 font-semibold leading-tight">{quizAverage === 0 ? 'No quizzes yet' : 'Keep practicing'}</span>
        </div>
        
        <div className="bg-white border border-slate-100 rounded-[28px] p-7 flex flex-col shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-6">
             <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Weekly Goal</span>
             <TrendingUp className="w-[18px] h-[18px] opacity-70 text-slate-400" />
          </div>
          <div className="font-display font-extrabold text-[40px] tracking-tight text-[#110B29] leading-none mb-3">{weeklyPercent}%</div>
          <span className="text-[13.5px] text-slate-400 font-semibold leading-tight">{weeklyPercent >= 100 ? `Goal crushed — ${weeklyMinutes} min this week` : `${weeklyMinutes} of ${weeklyGoal} min this week`}</span>
        </div>
      </div>
      
      {loaded && !returning && setupProgressPercent < 100 && (
      <>
      {/* What unlocks next */}
      <div className="bg-white rounded-[32px] p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
         <h3 className="font-display font-extrabold text-[24px] text-[#110B29] tracking-tight mb-8">What unlocks next</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#EAE4FF] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <BookOpen className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Syllabus → study plan</h4>
               <p className="text-[#695D94] text-[15px] font-medium leading-relaxed">Drop your WAEC, JAMB or course outline. We map every topic to a session.</p>
            </div>
            
            <div className="bg-[#FFF6D9] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20"/><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"/><path d="M4 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8"/><path d="M12 2v20"/></svg>
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Flashcards that adapt</h4>
               <p className="text-[#A5824C] text-[15px] font-medium leading-relaxed">Cards resurface exactly when you're about to forget them.</p>
            </div>
            
            <div className="bg-[#B9E9CD] rounded-[28px] p-7">
               <div className="w-14 h-14 bg-[#110B29] rounded-full flex items-center justify-center mb-6 text-white shadow-sm">
                  <Target className="w-6 h-6" />
               </div>
               <h4 className="font-extrabold text-[18px] text-[#110B29] mb-3 leading-tight">Exam-shaped quizzes</h4>
               <p className="text-[#4E8D6B] text-[15px] font-medium leading-relaxed">Questions written in the style you'll actually be tested on.</p>
            </div>
         </div>
      </div>
      </>
      )}

    </div>
  );
}


export function Dashboard(props: DashboardProps) {
  const { 
    dashboardView, setDashboardView, 
    dashboardCurriculumId, dashboardSemesterId, 
    dashboardGoalId, dashboardCourseId, dashboardTopicId,
    setDashboardCourseId,
    setCurrentView 
  } = useNavigationStore();

  if (dashboardView === 'upload') {
    return <GlobalUploadFlow userId={props.userId} track={props.track || 'secondary'} onUploadComplete={() => setDashboardView('home')} />;
  }
  if (dashboardView === 'curriculum') {
    return <CurriculumResults 
      curriculumId={dashboardCurriculumId || undefined} 
      courseId={dashboardCourseId || undefined} 
      initialTopicId={dashboardTopicId || undefined} 
      userId={props.userId} 
      onBack={() => setDashboardView('courseDetail')}
    />;
  }
  if (dashboardView === 'semesterDetail' && dashboardSemesterId) {
    return <SemesterDetail 
             semesterId={dashboardSemesterId} 
             userId={props.userId} 
             onOpenCourse={(id) => { 
               setDashboardCourseId(id);
               setDashboardView('courseDetail');
             }} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'goalDetail' && dashboardGoalId) {
    return <GoalDetail 
             goalId={dashboardGoalId} 
             userId={props.userId} 
             onOpenCourse={(id) => {
               setDashboardCourseId(id);
               setDashboardView('courseDetail');
             }} 
             onBack={() => setDashboardView('home')} 
           />;
  }
  if (dashboardView === 'courseDetail') {
    return <CourseDetail userId={props.userId} onNavigate={setCurrentView} />;
  }

  return <DashboardHome {...props} />;
}