import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CourseUpload } from './CourseUpload';
import { Folder, Target, ArrowRight, Loader2, ArrowUpRight } from 'lucide-react';
import { Semester, LearningGoal } from '../types';
import { useNavigationStore } from './MainApp';

export function GlobalUploadFlow({ userId, track, onUploadComplete }: { userId: string, track: string, onUploadComplete: () => void }) {
  const { setDashboardView, setCurrentView } = useNavigationStore();
  const [loading, setLoading] = useState(true);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'single' | 'bulk' | null>(null);

  useEffect(() => {
    async function loadContainers() {
      if (track === 'university') {
        const { data } = await supabase.from('semesters').select('*').eq('student_id', userId).order('level_year', { ascending: false });
        if (data && data.length > 0) {
          setSemesters(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else if (track === 'independent') {
        const { data } = await supabase.from('learning_goals').select('*').eq('student_id', userId).order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setGoals(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else {
        // secondary track or fallback, we might not have containers, but let's just show single/bulk
      }
      setLoading(false);
    }
    loadContainers();
  }, [userId, track]);

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;

  // Step 1: Select Container (if applicable and multiple exist)
  if (!selectedContainer && ((track === 'university' && semesters.length > 0) || (track === 'independent' && goals.length > 0))) {
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in">
        <h2 className="text-xl font-bold text-ink mb-6">Select {track === 'university' ? 'Semester' : 'Goal'}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {track === 'university' && semesters.map(s => (
            <button key={s.id} onClick={() => setSelectedContainer(s.id)} className="flex items-center gap-4 p-5 text-left border border-border rounded-xl hover:border-accent transition-colors group bg-surface">
              <div className="bg-surface-alt p-3 rounded-lg"><Folder className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors" /></div>
              <div className="flex-1">
                <h3 className="font-bold text-ink">{s.level_year}00 Level</h3>
                <p className="text-sm text-slate-500">{s.semester_number === 1 ? 'First' : 'Second'} Semester</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
          {track === 'independent' && goals.map(g => (
            <button key={g.id} onClick={() => setSelectedContainer(g.id)} className="flex items-center gap-4 p-5 text-left border border-border rounded-xl hover:border-accent transition-colors group bg-surface">
              <div className="bg-surface-alt p-3 rounded-lg"><Target className="w-6 h-6 text-slate-400 group-hover:text-accent transition-colors" /></div>
              <div className="flex-1">
                <h3 className="font-bold text-ink">{g.goal_title}</h3>
                <p className="text-sm text-slate-500">{g.category || 'Goal'}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  if (!selectedContainer && track !== 'secondary') {
      return (
          <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in text-center">
              <p className="text-slate-500 mb-4 font-medium">You need to create a {track === 'university' ? 'Semester' : 'Goal'} first before adding materials.</p>
              <button 
                onClick={() => {
                  setCurrentView('curricula');
                  setDashboardView('home');
                }}
                className="bg-accent text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
              >
                Go to {track === 'university' ? 'Semesters' : 'Goals'} <ArrowUpRight className="w-4 h-4" />
              </button>
          </div>
      );
  }

  // Step 2: Select Upload Type
  if (!uploadType) {
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink">What do you want to add?</h2>
            {((track === 'university' && semesters.length > 1) || (track === 'independent' && goals.length > 1)) && (
                <button onClick={() => setSelectedContainer(null)} className="text-sm text-slate-500 hover:text-ink">Change {track === 'university' ? 'Semester' : 'Goal'}</button>
            )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <button onClick={() => setUploadType('single')} className="flex flex-col gap-2 p-6 text-left border border-border rounded-xl hover:border-accent transition-colors bg-surface">
            <h3 className="font-bold text-ink text-lg">Single Material / Course</h3>
            <p className="text-sm text-slate-500">Add a specific topic, document, or subject to generate targeted study materials.</p>
          </button>
          <button onClick={() => setUploadType('bulk')} className="flex flex-col gap-2 p-6 text-left border border-border rounded-xl hover:border-accent transition-colors bg-ink text-white">
            <h3 className="font-bold text-white text-lg">Full Outline / Syllabus</h3>
            <p className="text-sm text-slate-400">Paste your entire course outline and we'll break it down into organized topics.</p>
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Render CourseUpload
  return (
    <CourseUpload 
      userId={userId} 
      semesterId={track === 'university' && selectedContainer ? selectedContainer : undefined}
      goalId={track === 'independent' && selectedContainer ? selectedContainer : undefined}
      bulk={uploadType === 'bulk'}
      onUploadComplete={onUploadComplete} 
    />
  );
}
