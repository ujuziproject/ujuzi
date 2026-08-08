import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Semester, Course } from '../types';
import { Folder, Plus, ArrowLeft, BookOpen } from 'lucide-react';

export function SemesterList({ userId, onOpenSemester }: { userId: string, onOpenSemester: (semesterId: string) => void }) {
  const [semesters, setSemesters] = useState<(Semester & { course_count: number })[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [level, setLevel] = useState(1);
  const [term, setTerm] = useState(1);

  useEffect(() => {
    fetchSemesters();
  }, [userId]);

  const fetchSemesters = async () => {
    const { data: sems } = await supabase.from('semesters').select('*').eq('student_id', userId).order('level_year', { ascending: false }).order('semester_number', { ascending: false });
    const semsList = sems || [];
    
    const enriched = await Promise.all(semsList.map(async (s) => {
      const { count } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('semester_id', s.id);
      return { ...s, course_count: count || 0 };
    }));
    
    setSemesters(enriched);
  };

  const handleCreate = async () => {
    const { data, error } = await supabase.from('semesters').insert({
      student_id: userId,
      level_year: level,
      semester_number: term
    }).select().single();
    
    if (data) {
      setIsCreating(false);
      fetchSemesters();
    }
  };

  if (isCreating) {
    return (
      <div className="w-full">
        <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-ink mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="bg-surface-alt p-8 rounded-[2rem] border border-border max-w-md">
          <h2 className="text-xl font-bold text-ink mb-6 font-display">Create Semester</h2>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Level</label>
              <select value={level} onChange={e => setLevel(Number(e.target.value))} className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink">
                <option value={1}>100 Level</option>
                <option value={2}>200 Level</option>
                <option value={3}>300 Level</option>
                <option value={4}>400 Level</option>
                <option value={5}>500 Level</option>
                <option value={6}>600 Level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-2">Semester</label>
              <select value={term} onChange={e => setTerm(Number(e.target.value))} className="w-full p-4 bg-surface border border-border rounded-2xl focus:outline-none focus:border-accent font-medium text-ink">
                <option value={1}>First Semester</option>
                <option value={2}>Second Semester</option>
              </select>
            </div>
          </div>
          <button onClick={handleCreate} className="w-full bg-ink text-white px-6 py-4 rounded-full font-bold hover:bg-ink/90 transition-colors shadow-sm">
            Create Semester
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black uppercase tracking-widest text-ink font-display">My Semesters</h2>
        <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-surface-alt border border-border text-ink hover:border-accent hover:text-accent px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Create Semester
        </button>
      </div>

      {semesters.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {semesters.map(s => (
            <button
              key={s.id}
              onClick={() => onOpenSemester(s.id)}
              className="flex flex-col text-left p-6 bg-surface-alt rounded-[2rem] border border-border hover:border-ink hover:shadow-md transition-all group"
            >
              <h3 className="text-lg font-bold text-ink mb-1 font-display">{s.level_year}00 Level — {s.semester_number === 1 ? 'First' : 'Second'} Semester</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mt-4">
                <BookOpen className="w-4 h-4" />
                <span className="font-mono">{s.course_count} Courses</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-surface-alt rounded-[2rem] border border-border p-12 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-20 h-20 rounded-full border border-border flex items-center justify-center mb-6">
            <Folder className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3 font-display">No Semesters</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md">You haven't created any semesters yet. Create one to organize your courses.</p>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-ink text-white px-8 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-ink/90 transition-colors"
          >
            + Create Semester
          </button>
        </div>
      )}
    </div>
  );
}
