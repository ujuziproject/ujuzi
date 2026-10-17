import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Semester, Course } from '../types';
import { Folder, Plus, ArrowLeft, BookOpen, Layers, Edit2 } from 'lucide-react';
import { CourseUpload } from './CourseUpload';

export function SemesterDetail({ semesterId, userId, onOpenCourse, onBack }: { semesterId: string, userId: string, onOpenCourse: (courseId: string) => void, onBack: () => void }) {
  const [semester, setSemester] = useState<Semester | null>(null);
  const [courses, setCourses] = useState<(Course & { topic_count: number, progress: number })[]>([]);
  const [view, setView] = useState<'list' | 'upload_single' | 'upload_bulk'>('list');

  useEffect(() => {
    fetchData();
  }, [semesterId]);

  const fetchData = async () => {
    const { data: sem } = await supabase.from('semesters').select('*').eq('id', semesterId).single();
    if (sem) setSemester(sem);

    const { data: coursesData } = await supabase.from('courses').select('*').eq('semester_id', semesterId).order('created_at', { ascending: false });
    const clist = coursesData || [];
    
    const enriched = await Promise.all(clist.map(async (c) => {
      const { data: curriculumTopics } = await supabase.from('topics').select('id').eq('course_id', c.id);
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
    
    setCourses(enriched);
  };

  if (view === 'upload_single' || view === 'upload_bulk') {
    return (
      <div className="w-full animate-in fade-in">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Semester
        </button>
        <CourseUpload userId={userId} semesterId={semesterId} bulk={view === 'upload_bulk'} onUploadComplete={() => { setView('list'); fetchData(); }} />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-ink font-display">
            {semester?.level_year}00 Level — {semester?.semester_number === 1 ? 'First' : 'Second'} Semester
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your courses for this semester.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setView('upload_single')} className="px-5 py-3 rounded-full border border-border bg-surface-alt text-ink font-bold hover:bg-surface transition-colors shadow-sm text-sm">
            + Add Single Course
          </button>
          <button onClick={() => setView('upload_bulk')} className="px-5 py-3 rounded-full bg-ink text-white font-bold hover:bg-ink/90 transition-colors shadow-sm text-sm">
            + Add Full Semester Outline
          </button>
        </div>
      </div>

      {courses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {courses.map(c => (
            <button
              key={c.id}
              onClick={() => onOpenCourse(c.id)}
              className="flex flex-col text-left p-6 bg-surface-alt rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between w-full mb-3 group/header">
                <h3 className="text-lg font-bold text-ink font-display leading-tight flex-1 flex items-center gap-2">
                   {c.course_title}
                   <div 
                     onClick={async (e) => {
                        e.stopPropagation();
                        const newTitle = prompt('Rename course:', c.course_title);
                        if (newTitle && newTitle.trim() !== '') {
                           await supabase.from('courses').update({ course_title: newTitle }).eq('id', c.id);
                           fetchData();
                        }
                     }}
                     className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-ink opacity-0 group-hover/header:opacity-100 transition-opacity"
                   >
                     <Edit2 className="w-3.5 h-3.5" />
                   </div>
                </h3>
                {c.course_code && (
                  <span className="bg-surface border border-border text-xs font-bold px-2 py-1 rounded-md ml-2 text-slate-500">{c.course_code}</span>
                )}
              </div>
              <div className="flex items-center justify-between w-full mt-auto pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  <Layers className="w-4 h-4" />
                  <span className="font-mono">{c.topic_count} Topics</span>
                </div>
                <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all" style={{ width: `${c.progress}%` }}></div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center mb-6">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Courses Yet</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md">Add courses individually or paste your entire semester outline to generate study materials.</p>
          <div className="flex gap-4">
            <button onClick={() => setView('upload_single')} className="bg-surface text-ink px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors border border-border">
              Add Single Course
            </button>
            <button onClick={() => setView('upload_bulk')} className="bg-ink text-white px-6 py-3 rounded-full font-bold hover:bg-ink/90 transition-colors">
              Add Full Outline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
