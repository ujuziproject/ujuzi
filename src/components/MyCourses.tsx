import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigationStore } from './MainApp';
import { BookOpen } from 'lucide-react';

export default function MyCourses({ userId, onNavigate }: { userId: string, onNavigate: (v: any) => void }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [track, setTrack] = useState<string>("secondary");
  const { setDashboardView, setDashboardCourseId, setDashboardSemesterId, setDashboardGoalId, setDashboardCurriculumId } = useNavigationStore();

  useEffect(() => {
    async function fetchCourses() {
      // Fetch user profile to know track
      
      const { data: profile } = await supabase.from('student_profiles').select('track').eq('id', userId).single();
      const currentTrack = profile?.track || 'secondary';
      setTrack(currentTrack);

      let fetchedCourses: any[] = [];
      
      // Fetch all semesters
      const { data: sems } = await supabase.from('semesters').select('id, level_year, semester_number').eq('student_id', userId);
      if (sems && sems.length > 0) {
        const { data: cs } = await supabase.from('courses').select('*').in('semester_id', sems.map(s => s.id));
        if (cs) {
          fetchedCourses.push(...cs.map(c => ({
            id: c.id, title: c.course_title, type: 'course', parent_id: c.semester_id,
            desc: `Semester ${sems.find(s=>s.id===c.semester_id)?.semester_number || ''}`
          })));
        }
      }
      
      // Fetch all goals
      const { data: goals } = await supabase.from('learning_goals').select('id, goal_title').eq('student_id', userId);
      if (goals && goals.length > 0) {
        const { data: cs } = await supabase.from('courses').select('*').in('goal_id', goals.map(g => g.id));
        if (cs) {
          fetchedCourses.push(...cs.map(c => ({
            id: c.id, title: c.course_title, type: 'course', parent_id: c.goal_id,
            desc: `Goal: ${goals.find(g=>g.id===c.goal_id)?.goal_title || ''}`
          })));
        }
      }
      
      // Fetch standalone curricula
      const { data: currs } = await supabase.from('curricula').select('*').eq('student_id', userId);
      if (currs && currs.length > 0) {
        fetchedCourses.push(...currs.map(c => ({ id: c.id, title: c.title, type: 'curriculum', parent_id: c.id, desc: 'Subject' })));
      }
// get topics for progress
      const courseProgress = await Promise.all(fetchedCourses.map(async (c) => {
        let topicQuery = supabase.from('topics').select('id, title').order('order_index', { ascending: true });
        if (c.type === 'course') topicQuery = topicQuery.eq('course_id', c.id);
        else topicQuery = topicQuery.eq('curriculum_id', c.id);
        
        const { data: topics } = await topicQuery;
        if (!topics || topics.length === 0) return { ...c, progress: 0, nextTopic: null, totalTopics: 0, mastered: 0 };
        
        // Find mastered
        const { data: flashcards } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', topics.map(t => t.id));
        let nextTopic = topics[0].title;
        let progress = 0;
        let mastered = 0;

        if (flashcards && flashcards.length > 0) {
          const { data: reviews } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days').eq('student_id', userId).in('flashcard_id', flashcards.map(f => f.id));
          const masteredCards = new Set((reviews || []).filter(r => r.interval_days >= 14).map(r => r.flashcard_id));
          
          let masteredTopics = 0;
          for (const t of topics) {
            const tCards = flashcards.filter(f => f.topic_id === t.id);
            if (tCards.length > 0 && tCards.every(fc => masteredCards.has(fc.id))) {
              masteredTopics++;
            } else {
              if (nextTopic === topics[0].title && masteredTopics > 0) {
                 nextTopic = t.title;
              }
            }
          }
          mastered = masteredTopics;
          progress = Math.round((masteredTopics / topics.length) * 100);
          if (progress < 100 && nextTopic === topics[0].title) nextTopic = topics[masteredTopics]?.title || nextTopic;
        }

        return { ...c, progress, nextTopic, totalTopics: topics.length, mastered };
      }));

      setCourses(courseProgress);
      setLoading(false);
    }
    fetchCourses();
  }, [userId]);

  const handleOpenCourse = (c: any) => {
    onNavigate('dashboard');
    if (c.type === 'course') {
      setDashboardCourseId(c.id);
      setDashboardView('courseDetail');
    } else {
      setDashboardCurriculumId(c.id);
      setDashboardView('courseDetail');
    }
  };

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="h-10 bg-slate-200 rounded w-full"></div></div>;
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-[#110B30] to-[#1A114D] rounded-3xl p-8 md:px-10 md:py-8 text-white relative overflow-hidden mb-6 shadow-sm">
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F5A623]/15 border border-[#F5A623]/25 text-[#F5A623] px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold mb-4">
              {courses.length} active courses
            </div>
            <h1 className="text-3xl font-bold font-display mb-2">My courses</h1>
            <p className="text-white/70">Pick up exactly where you left off — progress syncs across notes, flashcards and quizzes.</p>
          </div>
          <button onClick={() => { onNavigate('dashboard'); setDashboardView('upload'); }} className="bg-white text-ink px-5 py-2.5 rounded-full font-semibold text-[14px] hover:bg-white/90 transition-colors shadow-sm hidden md:flex items-center gap-1.5 shrink-0 z-20 relative">
            + Add Course
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5B4FE8]/20 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((c, i) => {
          const bgClass = i % 2 === 0 ? 'bg-[#EDEBFC] dark:bg-accent/15' : 'bg-[#FDF1DC] dark:bg-accent-warm/15';
          const barClass = i % 2 === 0 ? 'bg-gradient-to-r from-[#5B4FE8] to-[#7C6FF0]' : 'bg-[#F5A623]';

          return (
            <div 
              key={c.id} 
              onClick={() => handleOpenCourse(c)}
              className={`rounded-[20px] p-6 cursor-pointer hover:shadow-md transition-shadow border border-transparent ${bgClass}`}
            >
              <h3 className="font-display font-semibold text-[18px] text-ink mb-1">{c.title}</h3>
              <p className="text-[13.5px] text-ink/60 mb-4">{c.desc}</p>
              <div className="flex items-center gap-4 text-[12.5px] text-ink/60 mb-3.5">
                <span>🗂 {c.mastered}/{c.totalTopics} topics</span>
                <span>⏱ {Math.max(0, (c.totalTopics - c.mastered) * 15)} min left</span>
              </div>
              <div className="h-2 rounded-full bg-ink/5 overflow-hidden mb-3">
                 <div className={`h-full ${barClass} rounded-full`} style={{ width: `${c.progress}%` }}></div>
              </div>
              <div className="text-[13px] text-ink"><strong>Next:</strong> {c.nextTopic || 'Not started yet'}</div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-full py-10 text-center text-slate-500 bg-surface-alt rounded-2xl border border-border">
            No active courses found. Go to the Overview to upload new materials.
          </div>
        )}
      </div>
    </div>
  );
}
