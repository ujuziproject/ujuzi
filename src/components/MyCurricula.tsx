import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Curriculum } from '../types';
import { Loader2, BookOpen, Plus, ArrowLeft, Edit2 } from 'lucide-react';
import { CurriculumUpload } from './CurriculumUpload';
import { CurriculumResults } from './CurriculumResults';

export function MyCurricula({ userId }: { userId: string }) {
  const [view, setView] = useState<'list' | 'upload' | 'curriculum'>('list');
  const [curricula, setCurricula] = useState<(Curriculum & { topic_count: number; progress: number })[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurricula = async () => {
    setLoading(true);
    const { data: currs } = await supabase.from('curricula').select('id, title, status, student_id').eq('student_id', userId).order('created_at', { ascending: false });
    const currsList = currs || [];

    const enrichedCurricula = await Promise.all(currsList.map(async (c) => {
      const { data: topics } = await supabase.from('topics').select('id').eq('curriculum_id', c.id);
      const topicCount = topics?.length || 0;
      let progress = 0;

      if (topicCount > 0) {
        const topicIds = topics!.map(t => t.id);
        const { count: attemptedQuizzesCount } = await supabase
          .from('quiz_attempts')
          .select('id', { count: 'exact', head: true })
          .eq('student_id', userId)
          .in('quiz_id', (await supabase.from('quizzes').select('id').in('topic_id', topicIds)).data?.map(q => q.id) || []);
        
        progress = attemptedQuizzesCount ? Math.min(Math.round((attemptedQuizzesCount / topicCount) * 100), 100) : 0;
      }
      return { ...c, topic_count: topicCount, progress };
    }));

    setCurricula(enrichedCurricula);
    setLoading(false);
  };

  useEffect(() => {
    fetchCurricula();
  }, [userId]);

  if (loading && view === 'list') {
    return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }

  if (view === 'upload') {
    return (
      <div className="w-full">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to My Curricula
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">Upload Curriculum</h1>
          <p className="text-slate-500">Add a new subject or syllabus to generate study materials.</p>
        </div>
        <CurriculumUpload userId={userId} onUploadComplete={() => { fetchCurricula(); setView('list'); }} />
      </div>
    );
  }

  if (view === 'curriculum' && selectedCurriculumId) {
    return (
      <div className="w-full">
        <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to My Curricula
        </button>
        <CurriculumResults curriculumId={selectedCurriculumId} userId={userId} />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2 font-display">My Curricula</h1>
          <p className="text-slate-500">Manage and explore your study materials.</p>
        </div>
        <button onClick={() => setView('upload')} className="flex items-center gap-2 bg-ink text-white hover:bg-ink/90 px-5 py-3 rounded-full text-sm font-semibold transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Upload New
        </button>
      </div>

      {curricula.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {curricula.map(c => (
            <button
              key={c.id}
              onClick={() => { setSelectedCurriculumId(c.id); setView('curriculum'); }}
              className="flex items-center justify-between p-6 bg-surface-alt border border-border rounded-2xl hover:border-accent/50 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 p-3 rounded-xl text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-lg line-clamp-1 flex items-center gap-2 group/title">
                     {c.title}
                     <div 
                        onClick={async (e) => {
                           e.stopPropagation();
                           const newTitle = prompt('Rename curriculum:', c.title);
                           if (newTitle && newTitle.trim() !== '') {
                              await supabase.from('curricula').update({ title: newTitle }).eq('id', c.id);
                              fetchCurricula();
                           }
                        }}
                        className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-ink opacity-0 group-hover/title:opacity-100 transition-opacity"
                     >
                        <Edit2 className="w-4 h-4" />
                     </div>
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-semibold text-slate-500 bg-surface px-2 py-1 rounded-full">{c.topic_count} Topics</span>
                  </div>
                </div>
              </div>
              <div className="w-16">
                <div className="flex items-center justify-end mb-1">
                  <span className="text-xs font-bold text-success font-mono">{c.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${c.progress}%` }}></div>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-alt border border-border rounded-3xl">
          <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-accent/20">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-ink mb-2">No curricula yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">Upload your first syllabus or course outline to start generating personalized study materials.</p>
          <button onClick={() => setView('upload')} className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-accent/20 transition-all">
            Upload Curriculum
          </button>
        </div>
      )}
    </div>
  );
}
