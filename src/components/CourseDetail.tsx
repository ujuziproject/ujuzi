import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigationStore } from './MainApp';
import { Play, FileText, Library, CheckSquare } from 'lucide-react';

export default function CourseDetail({ userId, onNavigate }: { userId: string, onNavigate: (v: any) => void }) {
  const { dashboardCourseId, dashboardCurriculumId, setDashboardView, setDashboardTopicId } = useNavigationStore();
  const courseId = dashboardCourseId || dashboardCurriculumId;
  const isCurriculum = !!dashboardCurriculumId;

  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) {
      onNavigate('courses');
      return;
    }

    async function fetchData() {
      // fetch course
      let cData;
      if (isCurriculum) {
        const { data } = await supabase.from('curricula').select('*').eq('id', courseId).single();
        cData = { ...data, course_title: data?.title };
      } else {
        const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
        cData = data;
      }
      setCourse(cData);

      // fetch topics
      let topicQuery = supabase.from('topics').select('*').order('order_index', { ascending: true });
      if (isCurriculum) topicQuery = topicQuery.eq('curriculum_id', courseId);
      else topicQuery = topicQuery.eq('course_id', courseId);
      
      const { data: tData } = await topicQuery;
      let fetchedTopics = tData || [];

      // calculate progress based on mastery
      let masteredTopics = 0;
      if (fetchedTopics.length > 0) {
        const { data: flashcards } = await supabase.from('flashcards').select('id, topic_id').in('topic_id', fetchedTopics.map(t => t.id));
        if (flashcards && flashcards.length > 0) {
          const { data: reviews } = await supabase.from('flashcard_reviews').select('flashcard_id, interval_days').eq('student_id', userId).in('flashcard_id', flashcards.map(f => f.id));
          const masteredCards = new Set((reviews || []).filter(r => r.interval_days >= 14).map(r => r.flashcard_id));
          
          fetchedTopics = fetchedTopics.map(t => {
            const tCards = flashcards.filter(f => f.topic_id === t.id);
            const isMastered = tCards.length > 0 && tCards.every(fc => masteredCards.has(fc.id));
            if (isMastered) masteredTopics++;
            return { ...t, isMastered };
          });
          
          let foundCurrent = false;
          fetchedTopics = fetchedTopics.map(t => {
            if (t.isMastered) return { ...t, status: 'Mastered' };
            if (!foundCurrent) {
              foundCurrent = true;
              return { ...t, status: 'Continue' };
            }
            return { ...t, status: 'Upcoming' };
          });
        } else {
           fetchedTopics[0].status = 'Continue';
           for (let i = 1; i < fetchedTopics.length; i++) fetchedTopics[i].status = 'Upcoming';
        }
      }

      setTopics(fetchedTopics);
      setProgress(fetchedTopics.length > 0 ? Math.round((masteredTopics / fetchedTopics.length) * 100) : 0);
      setLoading(false);
    }
    fetchData();
  }, [courseId, userId, isCurriculum]);

  const handleOpenTopic = (topic: any) => {
    setDashboardTopicId(topic.id);
    setDashboardView('curriculum'); // The existing topic view viewer
  };

  const nextTopic = topics.find(t => t.status === 'Continue') || topics[0];

  if (loading) {
    return <div className="animate-pulse flex space-x-4"><div className="h-10 bg-slate-200 rounded w-full"></div></div>;
  }

  if (!course) return null;

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="bg-surface-alt border border-border rounded-[20px] p-7 md:p-8 mb-6">
        <div className="text-[13px] text-ink/60 mb-3.5">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-[#5B4FE8] font-semibold transition-colors">Dashboard</button>
          {' / '}
          <button onClick={() => onNavigate('courses')} className="hover:text-[#5B4FE8] font-semibold transition-colors">Courses</button>
          {' / '}
          <span className="text-ink">{course.course_title}</span>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-5">
          <div>
            <h1 className="text-3xl font-bold font-display mb-1.5">{course.course_title}</h1>
            <div className="text-[14px] text-ink/60">{topics.length} topics · Notes, flashcards & quizzes generated for each</div>
          </div>
          <div className="flex gap-6 items-center shrink-0">
            <div className="text-right">
               <div className="font-mono font-bold text-[20px] text-ink">{progress}%</div>
               <div className="text-[11.5px] text-ink/60 uppercase tracking-[0.04em]">Complete</div>
            </div>
            <div className="text-right">
               <div className="font-mono font-bold text-[20px] text-ink">≈{Math.max(0, topics.filter(t => t.status !== 'Mastered').length * 15)}m</div>
               <div className="text-[11.5px] text-ink/60 uppercase tracking-[0.04em]">Left today</div>
            </div>
          </div>
        </div>
        
        <div className="h-2.5 rounded-full bg-border overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-[#5B4FE8] to-[#7C6FF0] rounded-full" style={{ width: `\${progress}%` }}></div>
        </div>
        
        {nextTopic && (
          <button 
            onClick={() => handleOpenTopic(nextTopic)}
            className="inline-flex items-center gap-2 bg-[#5B4FE8] text-white px-6 py-[14px] rounded-full text-[14.5px] font-semibold hover:bg-[#5B4FE8]/90 transition-colors shadow-[0_8px_22px_-6px_rgba(91,79,232,0.55)]"
          >
            <Play className="w-[18px] h-[18px] fill-current" /> Continue — {nextTopic.title}
          </button>
        )}
      </div>

      <div className="bg-surface-alt border border-border rounded-[20px] p-6 lg:p-7">
        <div className="mb-4.5">
           <h3 className="font-display font-semibold text-[18px]">Topics</h3>
        </div>
        
        <div className="flex flex-col gap-2.5">
          {topics.map((t, i) => {
            const isMastered = t.status === 'Mastered';
            const isCurrent = t.status === 'Continue';
            
            // assign random icon background for visual variety, or fixed based on index
            const typeClass = i % 3 === 0 ? 'bg-[#EDEBFC] dark:bg-accent/15 text-[#5B4FE8]' : i % 3 === 1 ? 'bg-[#FDF1DC] dark:bg-accent-warm/15 text-[#F5A623]' : 'bg-[#DDF5EC] dark:bg-success/15 text-[#2FBF8F]';
            const Icon = i % 3 === 0 ? FileText : i % 3 === 1 ? Library : CheckSquare;

            return (
              <div 
                key={t.id} 
                onClick={() => handleOpenTopic(t)}
                className={`flex items-center gap-4 p-4 px-5 bg-surface-alt border \${isCurrent ? 'border-[#5B4FE8] bg-[#EDEBFC] dark:bg-accent/15' : 'border-border'} rounded-2xl cursor-pointer hover:shadow-sm transition-all \${isMastered ? 'opacity-65' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center \${typeClass}`}>
                   <Icon className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-semibold text-[15px] mb-0.5">{t.title}</h4>
                   <div className="text-[12.5px] text-ink/60">Notes · Flashcards · Quiz {isCurrent && '— next up'}</div>
                </div>
                <div className="ml-auto shrink-0 pl-2">
                   {isMastered && <span className="font-mono text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.04em] bg-[#DDF5EC] dark:bg-success/15 text-[#2FBF8F]">Mastered</span>}
                   {isCurrent && <span className="font-mono text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.04em] bg-[#5B4FE8] text-white">Continue</span>}
                   {t.status === 'Upcoming' && <span className="font-mono text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-[0.04em] bg-border text-ink/60">Upcoming</span>}
                </div>
              </div>
            );
          })}
          {topics.length === 0 && <div className="text-sm text-slate-500 py-4 text-center">No topics found in this course.</div>}
        </div>
      </div>
    </div>
  );
}
