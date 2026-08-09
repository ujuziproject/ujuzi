import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Clock, BrainCircuit, Target, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../lib/utils';

export function Progress({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [totalStudySeconds, setTotalStudySeconds] = useState(0);
  const [dailyData, setDailyData] = useState<{ day: string, minutes: number }[]>([]);
  const [courseData, setCourseData] = useState<{ name: string, minutes: number }[]>([]);
  const [strengths, setStrengths] = useState<any[]>([]);
  const [weaknesses, setWeaknesses] = useState<any[]>([]);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    async function loadProgress() {
      // Fetch data
      const [sessionsRes, attemptsRes, quizzesRes, topicsRes, coursesRes] = await Promise.all([
        supabase.from('study_sessions').select('*').eq('student_id', userId),
        supabase.from('quiz_attempts').select('*').eq('student_id', userId),
        supabase.from('quizzes').select('id, topic_id'),
        supabase.from('topics').select('id, title, course_id'),
        supabase.from('courses').select('id, course_title')
      ]);

      const sessions = sessionsRes.data || [];
      const attempts = attemptsRes.data || [];
      const quizzes = quizzesRes.data || [];
      const topics = topicsRes.data || [];
      const courses = coursesRes.data || [];

      // 1. Total Study Time
      let totalSecs = 0;
      const now = new Date();
      sessions.forEach(s => {
        let dur = s.duration_seconds;
        if (dur == null || dur === undefined) {
            // uncapped active session or bad state. cap at 30 minutes.
            const started = new Date(s.started_at);
            dur = Math.round((now.getTime() - started.getTime()) / 1000);
            if (dur > 1800) dur = 1800;
        }
        totalSecs += dur;
      });
      setTotalStudySeconds(totalSecs);

      // 2. Study Time by Day (last 7 days)
      const days: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[d.toLocaleDateString(undefined, { weekday: 'short' })] = 0;
      }
      
      sessions.forEach(s => {
         const started = new Date(s.started_at);
         const dayKey = started.toLocaleDateString(undefined, { weekday: 'short' });
         if (days[dayKey] !== undefined) {
             let dur = s.duration_seconds;
             if (dur == null) {
                const diff = Math.round((now.getTime() - started.getTime()) / 1000);
                dur = diff > 1800 ? 1800 : diff;
             }
             days[dayKey] += (dur / 60); // in minutes
         }
      });
      
      const chartData = Object.keys(days).map(k => ({ day: k, minutes: Math.round(days[k]) }));
      setDailyData(chartData);

      // 3. Time by Course
      const cTime: Record<string, number> = {};
      sessions.forEach(s => {
         const topic = topics.find(t => t.id === s.topic_id);
         if (topic && topic.course_id) {
             let dur = s.duration_seconds;
             if (dur == null) dur = 1800; // cap at 30 min approx if null
             if (!cTime[topic.course_id]) cTime[topic.course_id] = 0;
             cTime[topic.course_id] += dur;
         }
      });
      
      const courseChartData = Object.keys(cTime).map(cid => {
          const c = courses.find(c => c.id === cid);
          return {
              name: c ? c.course_title : 'Unknown Course',
              minutes: Math.round(cTime[cid] / 60)
          };
      }).sort((a, b) => b.minutes - a.minutes);
      setCourseData(courseChartData);

      // 4. Strengths and Weaknesses
      const topicScores: Record<string, { totalScore: number, totalMax: number, count: number }> = {};
      
      attempts.forEach(a => {
         const q = quizzes.find(qz => qz.id === a.quiz_id);
         if (q) {
            if (!topicScores[q.topic_id]) {
                topicScores[q.topic_id] = { totalScore: 0, totalMax: 0, count: 0 };
            }
            topicScores[q.topic_id].totalScore += a.score;
            topicScores[q.topic_id].totalMax += Math.max(a.total_questions, 1);
            topicScores[q.topic_id].count += 1;
         }
      });
      
      const rankedTopics = topics.map(t => {
          const stats = topicScores[t.id];
          if (stats) {
             return { id: t.id, title: t.title, percent: Math.round((stats.totalScore / stats.totalMax) * 100), attempted: true };
          }
          return { id: t.id, title: t.title, percent: 0, attempted: false };
      });
      
      // Sort: highest percent first
      const attempted = rankedTopics.filter(t => t.attempted).sort((a, b) => b.percent - a.percent);
      const unattempted = rankedTopics.filter(t => !t.attempted);
      
      setStrengths(attempted.slice(0, 3));
      
      // Weaknesses: bottom 3 of attempted, or if less than 3, pad with unattempted
      const bottomAttempted = [...attempted].reverse().slice(0, 3).reverse();
      if (bottomAttempted.length < 3) {
          const needed = 3 - bottomAttempted.length;
          const toAdd = unattempted.slice(0, needed);
          setWeaknesses([...bottomAttempted, ...toAdd]);
      } else {
          setWeaknesses(bottomAttempted);
      }

      // 5. Active Dates for Calendar
      const active = new Set<string>();
      sessions.forEach(s => {
         const date = new Date(s.started_at);
         active.add(`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`);
      });
      setActiveDates(active);

      setLoading(false);
    }
    loadProgress();
  }, [userId]);

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${month}-${day}`;
      const isActive = activeDates.has(dateStr);
      const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      
      days.push(
        <div 
          key={day} 
          className={cn(
            "h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all",
            isActive ? "bg-accent text-white shadow-md shadow-accent/20" : "bg-surface text-slate-500",
            isToday && !isActive ? "border-2 border-accent text-accent" : "",
            "hover:scale-110 cursor-default"
          )}
        >
          {day}
        </div>
      );
    }
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    return (
      <div className="bg-surface-alt p-6 rounded-[2rem] border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-ink text-lg font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Study Consistency
          </h3>
          <div className="flex items-center gap-2">
             <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold">&lt;</button>
             <span className="text-sm font-bold text-ink">{monthNames[month]} {year}</span>
             <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 font-bold">&gt;</button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
          <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  const hours = Math.floor(totalStudySeconds / 3600);
  const minutes = Math.floor((totalStudySeconds % 3600) / 60);

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink mb-2 font-display">Study Analytics</h1>
        <p className="text-slate-500">Insights into your learning habits and performance.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="bg-ink text-white p-8 rounded-3xl shadow-sm flex flex-col justify-center min-h-[160px]">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest font-display mb-3">Total Study Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black font-display tracking-tighter">{hours}h</span>
            <span className="text-3xl font-bold font-display text-slate-300">{minutes}m</span>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-surface-alt p-6 rounded-3xl border border-border shadow-sm h-full min-h-[220px]">
           <h3 className="text-sm font-bold text-ink mb-4 uppercase tracking-widest font-display">Study Time (Last 7 Days)</h3>
           <div className="h-40 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={dailyData}>
                 <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                 <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                 <Bar dataKey="minutes" fill="#000" radius={[4, 4, 4, 4]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="text-center mb-10">
        {renderCalendar()}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h2 className="text-lg font-bold text-ink mb-4 font-display flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-success" /> Strengths
          </h2>
          <div className="space-y-3">
             {strengths.length > 0 ? strengths.map(t => (
                 <div key={t.id} className="bg-surface-alt p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm">
                    <span className="font-semibold text-ink line-clamp-1 flex-1 mr-4">{t.title}</span>
                    <span className="font-bold font-mono text-success bg-success/10 px-3 py-1 rounded-full text-sm">{t.percent}%</span>
                 </div>
             )) : (
                 <div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm font-medium text-slate-500">
                    Not enough quiz data yet to calculate strengths.
                 </div>
             )}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-ink mb-4 font-display flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-warm" /> Weaknesses
          </h2>
          <div className="space-y-3">
             {weaknesses.length > 0 ? weaknesses.map(t => (
                 <div key={t.id} className="bg-surface-alt p-5 rounded-2xl border border-border flex items-center justify-between shadow-sm">
                    <span className="font-semibold text-ink line-clamp-1 flex-1 mr-4">{t.title}</span>
                    {t.attempted ? (
                        <span className="font-bold font-mono text-accent-warm bg-accent-warm/10 px-3 py-1 rounded-full text-sm">{t.percent}%</span>
                    ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full"><AlertCircle className="w-3 h-3"/> Not yet tested</span>
                    )}
                 </div>
             )) : (
                 <div className="p-6 bg-surface border border-border rounded-2xl text-center text-sm font-medium text-slate-500">
                    Not enough quiz data yet to calculate weaknesses.
                 </div>
             )}
          </div>
        </div>
      </div>
      
      {courseData.length > 0 && (
          <div>
              <h2 className="text-lg font-bold text-ink mb-4 font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-ink" /> Time by Course
              </h2>
              <div className="bg-surface-alt p-6 rounded-3xl border border-border shadow-sm">
                 <div className="space-y-4">
                    {courseData.map((c, i) => {
                        const max = courseData[0].minutes;
                        const w = Math.max(5, (c.minutes / max) * 100);
                        return (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between items-end">
                                    <span className="font-semibold text-sm text-ink">{c.name}</span>
                                    <span className="text-xs font-mono text-slate-500">{Math.floor(c.minutes / 60)}h {c.minutes % 60}m</span>
                                </div>
                                <div className="w-full bg-surface rounded-full h-2">
                                    <div className="bg-ink h-full rounded-full" style={{ width: `${w}%` }}></div>
                                </div>
                            </div>
                        )
                    })}
                 </div>
              </div>
          </div>
      )}

    </div>
  );
}
