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
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  const [newLevelYear, setNewLevelYear] = useState('1');
  const [newSemesterNumber, setNewSemesterNumber] = useState('1');

  useEffect(() => {
    async function loadContainers() {
      if (track === 'university') {
        const { data } = await supabase.from('semesters').select('*').eq('student_id', userId).order('level_year', { ascending: false });
        if (data) {
          setSemesters(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
      } else {
        const { data } = await supabase.from('learning_goals').select('*').eq('student_id', userId).order('created_at', { ascending: false });
        if (data) {
          setGoals(data);
          if (data.length === 1) setSelectedContainer(data[0].id);
        }
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
  
  const handleCreateInlineGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.from('learning_goals').insert({
      student_id: userId,
      goal_title: newGoalTitle,
      category: newGoalCategory,
      target_date: newGoalDate || null
    }).select('*').single();
    if (data) {
       setGoals([data]);
       setSelectedContainer(data.id);
    }
    setLoading(false);
  };

  if (!selectedContainer && track !== 'university' && goals.length === 0) {
    return (
      <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-lg mx-auto">
         <div className="text-center mb-6">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-ink">Set your first goal</h2>
            <p className="text-sm text-slate-500 mt-2">Before adding study materials, tell us what you're working towards.</p>
         </div>
         <form onSubmit={handleCreateInlineGoal} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Goal Title</label>
              <input type="text" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} required className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" placeholder="e.g. Pass AWS Solutions Architect" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Category (Optional)</label>
              <input type="text" value={newGoalCategory} onChange={e => setNewGoalCategory(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" placeholder="e.g. Cloud Certification" />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Target Date (Optional)</label>
              <input type="date" value={newGoalDate} onChange={e => setNewGoalDate(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent/90 transition-colors mt-6 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Goal & Continue'}
            </button>
         </form>
      </div>
    );
  }

  const handleCreateInlineSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('semesters').insert({
      student_id: userId,
      level_year: parseInt(newLevelYear, 10) || 1,
      semester_number: parseInt(newSemesterNumber, 10) || 1,
      is_current: true
    }).select('*').single();
    if (data) {
       setSemesters([data]);
       setSelectedContainer(data.id);
    }
    setLoading(false);
  };

  if (!selectedContainer && track === 'university' && semesters.length === 0) {
      return (
        <div className="bg-surface-alt rounded-2xl border border-border p-8 animate-in fade-in max-w-lg mx-auto">
           <div className="text-center mb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Folder className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-bold text-ink">Set your first semester</h2>
              <p className="text-sm text-slate-500 mt-2">Before adding study materials, tell us what semester you are in.</p>
           </div>
           <form onSubmit={handleCreateInlineSemester} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Level / Year</label>
                <select value={newLevelYear} onChange={e => setNewLevelYear(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent">
                   <option value="1">100 Level / 1st Year</option>
                   <option value="2">200 Level / 2nd Year</option>
                   <option value="3">300 Level / 3rd Year</option>
                   <option value="4">400 Level / 4th Year</option>
                   <option value="5">500 Level / 5th Year</option>
                   <option value="6">600 Level / 6th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider mb-2">Semester</label>
                <select value={newSemesterNumber} onChange={e => setNewSemesterNumber(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-accent">
                   <option value="1">First Semester</option>
                   <option value="2">Second Semester</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-accent text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent/90 transition-colors mt-6 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Semester & Continue'}
              </button>
           </form>
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
      goalId={track !== 'university' && selectedContainer ? selectedContainer : undefined}
      bulk={uploadType === 'bulk'}
      onUploadComplete={onUploadComplete} 
    />
  );
}
